import { useEffect, useState } from "react";

export default function DigitalClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        setTime(new Date());

        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="text-center">
            <div className="text-3xl font-bold font-mono text-white">
                {formatTime(time)}
            </div>
            <div className="text-sm text-white">
                {formatDate(time)}
            </div>
        </div>
    );
}