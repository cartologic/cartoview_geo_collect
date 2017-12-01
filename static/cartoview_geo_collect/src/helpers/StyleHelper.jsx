import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
import Image from 'Source/img/marker.png'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Text from 'ol/style/text'

class StyleHelper {
    getMarker = () => {
        const marker = new Style({
            image: new Icon({
                anchor: [
                    0.5, 31
                ],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',

                src: Image
            }),
            text: new Text({
                text: '+',
                fill: new Fill({ color: '#fff' }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2
                }),
                textAlign: 'center',
                offsetY: -20,
                font: '18px serif'
            })
        })
        return marker
    }
}
export default new StyleHelper()