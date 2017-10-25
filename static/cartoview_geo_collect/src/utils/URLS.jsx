class URLS {
    constructor(urls) {
        this.urls = urls
    }
    encodeURL = (url) => {
        return encodeURIComponent(url).replace(/%20/g, '+')
    }
    getProxiedURL = (url) => {
        const proxy = this.urls.proxy
        let proxiedURL = url
        if (proxy) {
            proxiedURL = this.urls.proxy + this.encodeURL(url)
        }
        return proxiedURL
    }
}
export default URLS
