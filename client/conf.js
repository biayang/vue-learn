module.exports = {
    server: (process.env.NODE_ENV === 'prod') ? '' : 'http://127.0.0.1:8088/',
    serverDevPort: 8087,
     /**
     * auth
     */
    auth: {
        git: ['admin', 'qa', 'pm'],
        trans: ['admin', 'pm'],
        add: ['admin']
    },
    // trans
    transLangBase: 'en',
    transLangs: [
        {
            field: "en",
            title: "En (base)",
        },
        {
            field: "en_prod",
            title: "EN(polished)",
        },
        {
            field: "zh",
            title: "Zh",
        },
        {
            field: "de",
            title: "De",
        },
        {
            field: "fr",
            title: "Fr",
        },
    ],
    transPriorityList: [
        {
            label: "0",
            value: 0,
            color: null,
        },
        {
            label: "1",
            value: 1,
            color: "#FFD6BB",
        },
        {
            label: "2",
            value: 2,
            color: "#FFA366",
        },
        {
            label: "3",
            value: 3,
            color: "#FF6600",
        },
    ],
    transLangUpdByBaseColor: "#E0EEEE",
}