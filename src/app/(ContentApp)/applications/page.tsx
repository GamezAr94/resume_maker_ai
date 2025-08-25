'use client';

import React, { useState, useEffect } from 'react';
import { Title, Text, rem, Stack, Loader, Center } from '@mantine/core';
import { ApplicationData } from '@/utils/interfaces';
import { getUserApplications } from '@/app/db/user_queries';
import { ApplicationCard } from '@/app/components/applications/ApplicationCard';

export default function MyApplications() {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            setError(null);
            const response = await getUserApplications();
            //console.log(response);

            if (response.status && response.data) {
                // Map the database fields to the component's expected props
                const formattedData = response.data.map((app: any) => ({
                    id: app.id,
                    jobTitle: app.job_position,
                    company: app.company_name,
                    description: app.job_description,
                    // Format the date to be more readable
                    appliedDate: `Applied ${new Date(
                        app.created_at,
                    ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}`,
                    link: 'resume/' + app.id, // Add a placeholder link
                }));
                setApplications(formattedData);
            } else {
                setError(response.message);
            }
            setIsLoading(false);
        };

        fetchApplications();
    }, []); // The empty array ensures this runs only once when the component mounts

    const renderContent = () => {
        if (isLoading) {
            return (
                <Center>
                    <Loader />
                </Center>
            );
        }

        if (error) {
            return (
                <Center>
                    <Text c="red">Error: {error}</Text>
                </Center>
            );
        }

        if (applications.length === 0) {
            return (
                <Center>
                    <Text>You haven't created any job applications yet.</Text>
                </Center>
            );
        }

        return (
            <Stack gap="md">
                {applications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                ))}
            </Stack>
        );
    };

    return (
        <div
            style={{
                padding: rem(32),
                backgroundColor: '#f8fafc',
                fontFamily: 'sans-serif',
            }}
        >
            <div style={{ maxWidth: rem(896), margin: '0 auto' }}>
                {/* Header Section */}
                <header style={{ marginBottom: rem(32) }}>
                    <Title order={1} style={{ color: '#1e293b' }}>
                        My Applications
                    </Title>
                    <Text c="dimmed" mt="xs">
                        Track and manage your job applications
                    </Text>
                </header>

                {/* Application Card Section */}
                <main>{renderContent()}</main>
            </div>
        </div>
    );
}
