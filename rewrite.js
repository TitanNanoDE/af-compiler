const fs = require('fs');

const rewrite = function(config) {
    return () => {
        let map = fs.readFileSync(config.sourceMap, 'utf-8');

        map = JSON.parse(map);

        map.sources.map(source => {
            source.replace(/\/\/\//, '//').replace(/(!?\.)\.\//, '');
        });
    };
};

export default rewrite;
