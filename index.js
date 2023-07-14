import { open, writeFile } from "node:fs/promises";

import fs from "fs";

import axios from "axios";
let filehandle = null;

try {
    filehandle = await open("english.json", "r+");

    fs.readFile("english.json", "utf-8", async (err, fileData) => {
        if (err) {
            console.log("err", err);
            return;
        }

        const languages = [
            // { code: 'DE', name: 'German' },
            { code: "FR", name: "French" },
            // { code: 'IT', name: 'Italian' },
            // { code: 'JA', name: 'Japanese' }, // notworking
            // { code: 'ES', name: 'Spanish' },
            // { code: 'NL', name: 'Dutch' }, // not working
            // { code: 'PL', name: 'Polish' },
            // { code: 'PT', name: 'Portuguese' },
            // { code: 'RU', name: 'Russian' },
            // { code: 'ZH', name: 'Chinese' }, // not working
        ];

        languages.forEach(async (language) => {
            if (fileData) {
                const jsonData = JSON.parse(fileData);

                const config = {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    params: {
                        auth_key: "Your API_KEY", // https://www.deepl.com/account/summary
                        text: JSON.stringify(jsonData),
                        target_lang: language.code, // Replace with your desired target language code
                    },
                };

                const deepL = await axios.post(
                    "https://api-free.deepl.com/v2/translate",
                    null,
                    config
                );

                if (deepL.status !== 200) {
                    console.log("deepL", deepL);
                    return;
                } else {
                    const parsedData = JSON.parse(deepL.data.translations[0].text);

                    const mappedData = {};

                    Object.keys(parsedData).forEach((key, index) => {
                        mappedData[index] = parsedData[key];
                    });

                    const tranlatedData = {};

                    for (const [index, [key, _]] of Object.entries(
                        Object.entries(jsonData)
                    )) {
                        tranlatedData[key] = mappedData[index];
                    }

                    await writeFile(
                        `${language.name}.json`,
                        JSON.stringify(tranlatedData)
                    );
                }
            }
        });
    });
} finally {
    await filehandle?.close();
}
