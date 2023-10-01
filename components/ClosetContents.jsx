'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import Loading from './loading';
import PocketBase from 'pocketbase'
import Modal from './Modal';
const pb = new PocketBase('https://servants-room-qr-codes.pockethost.io');
pb.autoCancellation(false);
export default function ClosetContents({ COLOR }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authData, setAuthData] = useState(null);
    const [takenItemId, setTakenItemId] = useState(null);

    useEffect(() => {
        (async () => {
            await pb.collection('items').getFullList({
                expand: ['with']
            }).then((jsonData) => {
                setData(jsonData);
                setIsLoading(false);
            }).catch((error) => {
                console.error(error);
            });
        })();
    }, []);

    const takeItem = async (e) => {
        e.preventDefault();
        let itemId = e.target.parentElement.parentElement.id;
        // Use the callback form of setTakenItemId
        setTakenItemId((prevItemId) => {
            // Inside this callback, you have access to the previous state value (prevItemId)
            console.log(prevItemId); // This will log the previous itemId, not the updated one
            return itemId; // Update the state with the new itemId
        });
        console.log(takenItemId);
        if (!JSON.parse(localStorage.getItem('pocketbase_auth'))) {
            let authDataAwait = await pb.collection('users').authWithOAuth2({ provider: 'google' });
            setAuthData(authDataAwait);
            setShowAuthModal(true);
        } else {
            await take();
            setTakenItemId(null);
        }
    }

    const take = async (e) => {
        await pb.collection('items').update(takenItemId, {
            with: JSON.parse(localStorage.getItem('pocketbase_auth')).model.id
        });
        await refreshData();
    }

    const putBackItem = async (e) => {
        e.preventDefault();
        const itemId = e.target.parentElement.parentElement.id;
        await pb.collection('items').update(itemId, {
            with: ""
        });
        await refreshData();
    };

    const saveName = async (e) => {
        e.preventDefault();
        const name = e.target.elements.name.value;
        // update Logged in user with the name variable
        await pb.collection('users').update(JSON.parse(localStorage.getItem('pocketbase_auth')).model.id, { name });
        setShowAuthModal(false);
        await take();
        setTakenItemId(null);
    }


    const getUserById = async (id) => {
        const user = await pb.collection('users').getOne(id);
        return user;
    }

    const refreshData = async () => {
        setIsLoading(true);
        await pb.collection('items').getFullList({
            expand: ['with']
        }).then((jsonData) => {
            setData(jsonData);
            setIsLoading(false);
        }).catch((error) => {
            console.error(error);
        });
    }

    const fuseOptions = {
        keys: ['name'],
        includeScore: true,
        threshold: 0.4,
    };

    const fuse = new Fuse(data, fuseOptions);

    const closetColors = {
        blue: 'rgba(52, 152, 219, 0.7)',
        slate: 'rgba(127, 140, 141, 0.7)',
        gray: 'rgba(149, 165, 166, 0.7)',
        zinc: 'rgba(52, 73, 94, 0.7)',
        neutral: 'rgba(236, 240, 241, 0.7)',
        stone: 'rgba(220, 221, 225, 0.7)',
        red: 'rgba(231, 76, 60, 0.7)',
        orange: 'rgba(230, 126, 34, 0.7)',
        amber: 'rgba(241, 196, 15, 0.7)',
        yellow: 'rgba(243, 156, 18, 0.7)',
        lime: 'rgba(197, 226, 21, 0.7)',
        green: 'rgba(46, 204, 113, 0.7)',
        emerald: 'rgba(46, 204, 113, 0.7)',
        teal: 'rgba(26, 188, 156, 0.7)',
        cyan: 'rgba(22, 160, 133, 0.7)',
        sky: 'rgba(52, 152, 219, 0.7)',
        indigo: 'rgba(142, 68, 173, 0.7)',
        violet: 'rgba(155, 89, 182, 0.7)',
        purple: 'rgba(155, 89, 182, 0.7)',
        fuchsia: 'rgba(231, 76, 60, 0.7)',
        pink: 'rgba(233, 30, 99, 0.7)',
        rose: 'rgba(216, 27, 96, 0.7)',
    };

    const getBgColor = (item) => {
        const color = closetColors[item.closet.toLowerCase()] || 'rgba(149, 165, 166, 0.7)';
        return { backgroundColor: color };
    };

    const renderFilteredItems = () => {
        console.log(data);
        if (searchTerm === '') {
            return data.filter((item) => item.closet.toLowerCase() === COLOR);
        }

        const filteredItems = fuse.search(searchTerm.toLowerCase());

        return filteredItems.map(({ item }) => item);
    };

    return (
        <>

            <Modal
                isVisible={showAuthModal}
            >
                <h1 className='text-2xl font-bold'>What&apos;s Your Name?</h1>
                <form onSubmit={saveName} className='gap-2 flex flex-col'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='name'>Name</label>
                        <input id='name' type='text' className='border rounded-lg p-2' />
                    </div>
                    <button type='submit' className='bg-blue-600 text-white rounded-lg p-2'>Save</button>
                </form>
            </Modal>

            <div className="min-h-screen p-4 bg-gray-100">
                {/* Search Input */}
                <div className="sticky top-2 z-10">
                    <div className="flex items-center justify-center bg-gray-50 shadow-lg rounded-lg p-1 md:mx-24 mx-6">
                        <input
                            id="query"
                            type="text"
                            placeholder="Search For Anything..."
                            className="text-gray-500 w-full p-2 outline-none bg-inherit text-center"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchTerm(e.target.value);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Filtered Items Container */}
                {isLoading ? (
                    <Loading />
                ) : (
                    <div id="filteredItems" className="flex flex-col gap-4 w-full p-4 z-0">
                        {/* Filtered items will be displayed here */}
                        {renderFilteredItems().map(async (item, index) => (
                            <div
                                id={item.id}
                                key={item.id}
                                className="item-card rounded-md border p-4 flex w-full text-left gap-2"
                                style={{
                                    position: 'relative',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    marginLeft: '8px',
                                    ...getBgColor(item),
                                }}
                            >
                                <span
                                    className="shelf-number"
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        backgroundColor: 'rgba(51, 51, 51, 0.7)',
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderTopLeftRadius: '8px',
                                        borderBottomRightRadius: '8px',
                                    }}
                                >
                                    Shelf {item.shelf}
                                </span>
                                <span
                                    className="item-name flex w-full"
                                    style={{
                                        marginLeft: '66px',
                                    }}
                                >
                                    {item.name}
                                    {item.with ? (
                                        localStorage.getItem('pocketbase_auth') &&
                                            item?.expand?.with?.id === JSON.parse(localStorage.getItem('pocketbase_auth')).model.id
                                            ? (
                                                <button onClick={putBackItem} className='ml-auto rounded-lg bg-green-600 px-2 text-white'>Put Back</button>
                                            ) : (
                                                <>
                                                    <span className='ml-auto text-sm'>Taken by <b>{item?.expand?.with?.name}</b></span>
                                                </>)
                                    ) : (
                                        <button onClick={takeItem} className='ml-auto rounded-lg bg-red-600 px-2 text-white'>Take</button>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}