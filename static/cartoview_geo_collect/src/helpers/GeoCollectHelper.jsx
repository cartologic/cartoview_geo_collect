import Collection from 'ol/collection'
import DragRotateAndZoom from 'ol/interaction/dragrotateandzoom'
import Feature from 'ol/feature'
import LayerHelper from 'Source/helpers/LayersHelper'
import Map from 'ol/map'
import Modify from 'ol/interaction/modify'
import OSM from 'ol/source/osm'
import Point from 'ol/geom/point'
import StyleHelper from 'Source/helpers/StyleHelper'
import Tile from 'ol/layer/tile'
import Vector from 'ol/layer/vector'
import { default as VectorSource } from 'ol/source/vector'
import View from 'ol/view'
import WFS from 'ol/format/wfs'
import extent from 'ol/extent'
import interaction from 'ol/interaction'
import proj from 'ol/proj'
import proj4 from 'proj4'
import t from 'tcomb-form'

const Int = t.refinement(t.Number, (n) => n % 1 == 0)
class GeoCollectHelper {
    getCenterOfExtent = (ext) => {
        const center = extent.getCenter(ext)
        return center
    }
    getPointGeomerty = (coordinates) => {
        let point = new Point(coordinates)
        return point
    }
    getPointFeature = (position,geometryName="the_geom") => {
        let feature = new Feature({})
        feature.setGeometryName(geometryName)
        feature.setGeometry(this.getPointGeomerty(position))
        return feature
    }
    wfsTransaction = (feature, layerName,targetNameSpace, crs) => {
        console.log(targetNameSpace) 
        let formatWFS = new WFS
        var formatGMLOptions = {
            featureNS: targetNameSpace,
            featurePrefix: LayerHelper.layerNameSpace(layerName),
            featureType: LayerHelper.layerName(layerName),
            gmlOptions: {
                srsName: `${crs}`
            },
            // srsName:"EPSG:"+crsCode
        }
        const node = formatWFS.writeTransaction([feature], null, null, formatGMLOptions)
        var serializer = new XMLSerializer()
        var stringXML = serializer.serializeToString(node)
        return stringXML
    }
    getModifyInteraction = (feature) => {
        let modifyInteraction = new Modify({
            features: new Collection([feature]),
            pixelTolerance: 32
        })
        return modifyInteraction
    }
    getMap = () => {
        let osmLayer = new Tile({
            title: 'OpenStreetMap',
            source: new OSM()
        })
        let map = new Map({
            interactions: interaction.defaults().extend([
                new DragRotateAndZoom()
            ]),
            layers: [osmLayer],
            view: new View({
                center: proj.fromLonLat([0, 0]),
                zoom: 6
            })
        })
        return map
    }

    getVectorLayer = (feature) => {
        let featureStyle = StyleHelper.getMarker()
        let vectorLayer = new Vector({
            source: new VectorSource({
                features: [feature]
            }),
            style: featureStyle,
        })
        return vectorLayer
    }
    buildForm = (attributes) => {
        let schema = {},
            fields = {},
            value = {}
        attributes.forEach(a => {
            if (a.included) {
                fields[a.name] = {
                    label: a.label,
                    help: a.helpText,
                    type: a.fieldType,
                    attrs: {
                        placeholder: a.placeholder
                    }
                }
                value[a.name] = a.defaultValue
                if (a.fieldType == "select") {
                    const options = {}
                    a.options.forEach(o => options[o.value] = o
                        .label)
                    schema[a.name] = t.enums(options)
                } else if (a.fieldType == "number") {
                    fields[a.name].type = 'number'
                    schema[a.name] = a.dataType == "int" ? Int :
                        t.Number
                } else if (a.fieldType == "checkbox") {
                    schema[a.name] = t.Bool
                }
                //default case if data type is string
                // here field type may be text or textarea
                else if (a.dataType == "string") {
                    schema[a.name] = t.String
                }
                if (schema[a.name]) {
                    if (a.required) {
                        fields[a.name].help += " (Required)"
                    } else {
                        schema[a.name] = t.maybe(schema[a.name])
                    }
                }
            }
        })
        return {
            schema,
            value,
            fields
        }
    }
    getCRS = (crs) => {
        let promise = new Promise((resolve, reject) => {
            if (proj4.defs('EPSG:' + crs)) {
                resolve(crs)
            } else {
                fetch("https://epsg.io/?format=json&q=" + crs).then(
                    response => response.json()).then(
                    projres => {
                        proj4.defs('EPSG:' + crs, projres.results[
                            0].proj4)
                        resolve(crs)
                    })
            }
        })
        return promise
    }
    zoomToLocation = (pointArray, map) => {
        const zoom = map.getView().getMaxZoom()
        const lonLat = this.reprojectLocation(pointArray, map)
        map.getView().setCenter(lonLat)
        map.getView().setZoom(zoom - 4)
    }
    reprojectLocation = (pointArray, map) => {
        /**
         * Reproject x,y .
         * @param {array} point - [longitude,latitude].
         */
        return proj.transform(pointArray, map.getView().getProjection(), 'EPSG:900913')
    }
    reprojectExtent = (extent, map) => {
        /**
         * Reproject extent .
         * @param {array} extent - [minX,minY,maxX,maxY].
         */
        return proj.transformExtent(extent, 'EPSG:4326', map.getView().getProjection())
    }
}
export default new GeoCollectHelper()
