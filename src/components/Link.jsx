import { useRouter } from '../hooks/useRouter.jsx'

export function Link({ to, children, ...rest }) {
    const {navigateTo} = useRouter();
    return (
        <a href={to} onClick={(e) => {
            e.preventDefault();
            navigateTo(to);
        }} {...rest}>
            {children}
        </a>
    );
}