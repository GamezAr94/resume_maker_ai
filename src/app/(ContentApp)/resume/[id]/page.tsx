'use client';
import { useParams } from 'next/navigation';

export default function Resume() {
    const params = useParams();
    const id = params.id;
    return (
        <>
            <div>Resume</div>
            <p>hola</p>
            <p>{id}</p>
        </>
    );
}
