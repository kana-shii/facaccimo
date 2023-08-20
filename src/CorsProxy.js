export default class CorsProxy {

    static URL = 'https://cors.stirante.com';

    static get(url, headers) {
        if (window.isElectron) {
            return fetch(url, {
                headers: headers
            })
        }
        if (url.startsWith('https://')) {
            url = url.replace('https://', '');
        }
        return fetch(CorsProxy.URL + '/' + url, {
            headers: headers
        })
    }
}