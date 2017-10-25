var webpack = require( 'webpack' )
var path = require( 'path' )
var BUILD_DIR = path.resolve( __dirname, 'dist' )
var APP_DIR = path.resolve( __dirname, 'src' )
var filename = '[name].bundle.js'
const production = process.argv.indexOf( '-p' ) !== -1
const plugins = [ new webpack.DefinePlugin( {
    'process.env': {
        'NODE_ENV': JSON.stringify( production ? 'production' : '' )
    }
} ), ]
const config = {
    entry: {
        geoCollect: path.join(APP_DIR, 'viewRender.jsx'),
        config: path.join( APP_DIR, 'AppRender.jsx' )
    },
    output: {
        path: BUILD_DIR,
        filename: filename,
        library: '[name]',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        publicPath: "/static/cartoview_feature_list/dist/"
    },
    node: {
        fs: "empty"
    },
    plugins: plugins,
    resolve: {
        extensions: [ '*', '.js', '.jsx' ]
    },
    module: {
        loaders: [ {
            test: /\.(js|jsx)$/,
            loader: 'babel-loader',
            exclude: /node_modules/
    }, {
            test: /\.xml$/,
            loader: 'raw-loader'
    }, {
            test: /\.json$/,
            loader: "json-loader"
    }, {
            test: /\.css$/,
            loader: "style-loader!css-loader"
    }, {
            test: /\.(png|jpg|gif)$/,
            loader: 'file-loader'
    } ],
        noParse: [ /dist\/ol\.js/, /dist\/jspdf.debug\.js/,
            /dist\/js\/tether\.js/ ]
    }
}
if ( production ) {
    const prodPlugins = [
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin( {
            compress: {
                warnings: true
            }
        } )
    ]
    Array.prototype.push.apply( plugins, prodPlugins )
} else {
    config.devtool = 'eval-cheap-module-source-map'
}
module.exports = config
