'use client';

import React from 'react';
import { Card, CardBody } from '@/components';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components';

export default function AdminPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Card className="max-w-md w-full">
                <CardBody className="text-center p-12">
                    <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                    <p className="text-neutral-500 mb-6">This section is currently under development.</p>
                    <Button onClick={() => router.push('/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Back to Dashboard
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}
