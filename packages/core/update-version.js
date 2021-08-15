const fs = require('fs');
const path = require('path');

function updatePackageJSON() {
  if (!process.env.PACKAGE_VERSION) {
    throw new Error('PACKAGE_VERSION is undefined!');
  }
  const packageInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json')),
  );
  packageInfo.version = process.env.PACKAGE_VERSION;
  fs.writeFileSync(
    path.resolve(__dirname, 'package.json'),
    JSON.stringify(packageInfo, null, 2),
  );
}

updatePackageJSON();
