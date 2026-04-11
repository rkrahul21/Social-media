'use client';

import React, { useState ,useEffect} from 'react';
import Image from 'next/image';



interface ProfileCardProps {
    name: string;
    bio: string;
    avatar: string;
    isFollowing?: boolean;
    onFollowClick?: (isFollowing: boolean) => void;
}

export default function Page({
    name,
    bio,
    avatar,
    isFollowing = false,
    onFollowClick,
}: ProfileCardProps) {
    const [following, setFollowing] = useState(isFollowing);

    const handleFollowClick = () => {
        const newState = !following;
        setFollowing(newState);
        onFollowClick?.(newState);
    };

    const [users, setUsers] = useState<ProfileCardProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            
            const userArray = Array.isArray(data) ? data : data.users || [];
            setUsers(userArray);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]); 
        } finally {
            setLoading(false);
        }
    };
    fetchUsers();
}, []);


    console.log("users state:", users);
    if (loading) {
        return <div className="text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {users.map((user, index) => (
                <div key={index} className="w-80 bg-white rounded-lg shadow-lg p-6 text-center">

                    <div className="flex justify-center mb-4">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500">
                            <Image
                                src={user.avatar}
                                alt={user.name}
                                fill
                                className="object-cover"
                                loading='eager'
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">{user.bio}</p>

                    <button
                        onClick={() => onFollowClick?.(!user.isFollowing)}
                        className={`w-full py-2 px-4 rounded-full font-semibold transition-colors ${
                            user.isFollowing
                                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            ))}
        </div>
    );
}