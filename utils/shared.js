import * as path from 'path';
import * as fs from 'fs';

export default function createFileWithDirectories(filePath, content) {
  const dir = path.dirname(filePath);

  fs.mkdir(dir, { recursive: true },
    (err) => {
      if (err) {
        throw err;
      }

      fs.writeFile(filePath, content,
        (err) => {
          if (err) {
            throw err;
          }
        });
    });
}
