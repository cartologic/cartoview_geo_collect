class LayersHelper {
    layerName = ( typeName ) => {
        return typeName.split( ":" ).pop()
    }
    layerNameSpace = ( typeName ) => {
        return typeName.split( ":" )[ 0 ]
    }
}
export default new LayersHelper()