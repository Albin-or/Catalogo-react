import {useEffect, useState} from 'react';

function getCurrentPath() {
    return window.location.pathname;
}

export function useRouter() {
    const [currentPath, setCurrentPath] = useState(getCurrentPath());

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(getCurrentPath());
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const getQueryParam = (param) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    };

    const navigateTo = (path) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    return { currentPath, navigateTo, getQueryParam };
}