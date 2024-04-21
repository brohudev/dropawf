import { useCookies } from 'react-cookie';

export function useLoginCookies() {
    const [cookies, setCookie] = useCookies(['userID', 'userRole', 'userFirstName']);

    return { cookies, setCookie };
}

export function useAppCookies() {
    const [cookies, setCookie] = useCookies(['userRole']);

    return { cookies, setCookie };
}

export function useUserIDCookie() {
    const [cookies, setCookie] = useCookies(['userID']);

    return { cookies, setCookie };
}
