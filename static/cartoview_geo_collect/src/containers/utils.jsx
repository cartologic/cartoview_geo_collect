import { getCRSFToken } from 'Source/helpers/helpers.jsx'

export const doGet = (url, extraHeaders = {}) => {
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "X-CSRFToken": getCRSFToken(),
            ...extraHeaders
        }
    }).then((response) => {
        return response.json()
    })
}
export const doPost = (url, data, extraHeaders = {},type='json') => {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            "X-CSRFToken": getCRSFToken(),
            ...extraHeaders
        }),
        body: data
    }).then((response) => {
        if(type==='json'){
            return response.json()
        }else if(type==='xml'){
            return response.text()
        }
        
    })
}