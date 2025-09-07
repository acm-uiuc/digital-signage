import { useEffect } from 'react';


const usePeriodicRefresh = () => {
    useEffect(() => {
        const getTimeout = () => {
            const now = new Date();
            const target = new Date(now);
            target.setHours(now.getHours() + 2, 0, 0, 0);
            return target.getTime() - now.getTime();
        };

        const timeoutDuration = getTimeout();
        console.log(`Refreshing page in ${timeoutDuration / 1000} seconds.`)
        const timerId = setTimeout(() => {
            window.location.reload();
        }, timeoutDuration);

        return () => clearTimeout(timerId);

    }, []);
};

export default usePeriodicRefresh;