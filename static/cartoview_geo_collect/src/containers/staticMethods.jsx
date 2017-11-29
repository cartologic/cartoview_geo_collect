import isURL from 'validator/lib/isURL'
export const getPropertyFromConfig = (config, property, defaultValue) => {
    const propertyValue = config && typeof (config[property]) !==
        "undefined" ? config[property] : defaultValue
    const nestedPropertyValue = config && config.config && typeof (config
        .config[property]) !== "undefined" ? config.config[
        property] : propertyValue
    return nestedPropertyValue
}
export const checkURL = (value) => {
    /* validator validate strings only */
    if (typeof (value) === "string") {
        return isURL(value)
    }
    return false
}
export const checkImageSrc = (src, good, bad) => {
    let img = new Image()
    img.onload = good
    img.onerror = bad
    img.src = src
}
export const getSelectOptions = (arr, label = null, value = null) => {
    let options = []
    if (arr && arr.length > 0) {
        options = arr.map(item => {
            if (!label) {
                return { value: item, label: item }
            }
            return {
                value: item[label], label: item[value ?
                    value : label]
            }
        })
    }
    return options
}
