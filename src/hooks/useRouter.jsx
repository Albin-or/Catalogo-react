import { useNavigate, useLocation } from 'react-router';

export function useRouter() {
    const navigate = useNavigate();
    const location = useLocation();

    const getQueryParam = (param) => {
        const params = new URLSearchParams(location.search);
        return params.get(param);
    };

    const navigateTo = (path) => {
        navigate(path);
    };

    return { currentPath: location.pathname, navigateTo, getQueryParam };
}