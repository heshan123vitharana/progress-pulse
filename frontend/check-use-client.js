const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');

function walk(directory) {
    let results = [];
    const list = fs.readdirSync(directory);

    list.forEach((file) => {
        file = path.resolve(directory, file);
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                const content = fs.readFileSync(file, 'utf8');
                const hasHooks = /use(State|Effect|Router|Params|SearchParams|Context|Reducer|Ref|LayoutEffect|Memo|Callback)/.test(content);
                const hasUseClient = /['"]use client['"]/.test(content);

                if (hasHooks && !hasUseClient) {
                    results.push(file);
                }
            }
        }
    });
    return results;
}

const missing = walk(dir);
console.log('Files missing "use client":');
missing.forEach(f => console.log(f));
