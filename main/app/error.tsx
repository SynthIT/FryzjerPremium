"use client";
export default function Error({ error }: { error: Error & { digest?: string } }) {
    return (<div>Wystąpił błąd: {error.message}</div>);
}