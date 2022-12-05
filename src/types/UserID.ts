/*
RLNCredentials JOSN format:

{
    "application": string,
    "appIdentifier": string,
    "credentials": [{
        "key": string,
        "commitment": string,
        "membershipGroups" : [{
            "chainId": number,
            "contract": string,
            "treeIndex": string
        }]
    }],
    "version": number
}
*/