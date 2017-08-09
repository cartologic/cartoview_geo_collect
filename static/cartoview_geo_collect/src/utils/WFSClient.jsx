import ol from 'openlayers';

class WFSClient {
  constructor(geoserverUrl) {
    this.url = geoserverUrl + "wfs";
  }

  loadLayerAsJSON(typeName) {
    // returns feature attributes to buildFormSchema

  }
  loadLayerAttributs(typeName) {
    const url = `${this.url}?service=wfs&version=2.0.0&outputFormat=application/json&request=DescribeFeatureType&featureTypes=${typeName}`;
    return fetch(url, {credentials: 'include'}).then((res) => res.json());
  }
  loadFeature(typeName, fid) {
    // returns olFeature based on geoserver existing feature
    const url = `${this.url}?service=wfs&version=2.0.0&outputFormat=application/json&request=GetFeature&typeNames=${typeName}&featureID=${fid}`;

    return fetch(url, {credentials: 'include'}).then((res) => res.json());
  }
  sendXMLRequest(xml){
    return fetch(this.url, {
      method: 'POST',
      body: xml,
      credentials: 'include',
      headers: new Headers({
        'Content-Type': 'text/xml',
      })
    });
  }
  insertFeature(typeName, properties, geometry){
    const [namespace, name] = typeName.split(":");
    console.log(namespace);
    const xml = `<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
          <Insert>
            <${name} xmlns="${namespace}">
              ${Object.keys(properties).map(key =>properties[key]==null ? "" : `<${key}>${properties[key]}</${key}>`).join("")}
              <${geometry.name}>
                <Point xmlns="http://www.opengis.net/gml" srsName="${geometry.srsName}">
                  <pos>${geometry.x} ${geometry.y}</pos>
                </Point>
              </${geometry.name}>
            </${name}>
          </Insert>
        </Transaction>`;
    return this.sendXMLRequest(xml);
  }
  updateFeature(typeName, fid, properties, geometry){
    const xml = `<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
      <Update typeName="${typeName}" >
        ${
          Object.keys(properties).map(key => `<Property>
            <Name>${key}</Name>
            <Value>${properties[key]}</Value>
          </Property>`)
        }
        <Property>
          <Name>${geometry.name}</Name>
          <Value>
            <Point xmlns="http://www.opengis.net/gml" srsName="${geometry.srsName}">
              <pos>${geometry.x} ${geometry.y}</pos>
            </Point>
          </Value>
        </Property>
        <Filter xmlns="http://www.opengis.net/ogc">
          <FeatureId fid="${fid}" />
        </Filter>
      </Update>
    </Transaction>`;
    return this.sendXMLRequest(xml)
  }
}

export default WFSClient;
