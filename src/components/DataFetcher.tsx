'use client'

import React, { useEffect, useState } from 'react';
import LoadingScreen from "@/components/LoadingScreen";

type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

function DataFetcher() {
    const [data, setData] = useState<Post | null>(null); // Properly type the state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts/1'); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const postData: Post = await response.json();
            setData(postData);
            console.log(postData);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {data ? (
                <div className="bg-white">
                    {/*use pre tag to retain formating of stringify*/}
                    <pre>{JSON.stringify(data, null, 2) }</pre>
                    {/*<h2>Post Details:</h2>*/}
                    {/*<p><strong>Title:</strong> {data.title}</p>*/}
                    {/*<p><strong>Body:</strong> {data.body}</p>*/}
                </div>
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
}

export default DataFetcher;
