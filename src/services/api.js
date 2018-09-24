const defaultAPI = process.env.REACT_APP_API_SERVER || "/api";

class Api {
    constructor(apiUrl) {        
        this.apiUrl = apiUrl || defaultAPI;
    }

    /**
     * Makes a GET request to the API server, and returns a promise
     * with the resulting JSON response.
     *
     * @example
     * get("loanRequests");
     * => <Promise>
     *
     * // Specifying only orders with REP as then collateral.
     * get("loanRequests?collateralTokenSymbol=REP");
     * => <Promise>
     *
     * @param resource
     * @returns {Promise<any>}
     */

    /**
     * Makes a GET request to the API server, and returns a promise
     * with the resulting JSON response.
     *
     * @example
     * get("loanRequests");
     * => <Promise>
     *
     * // Specifying only orders with REP as then collateral.
     * get("loanRequests?collateralTokenSymbol=REP");
     * => <Promise>
     *
     * // Similar to the above, using the params object:
     * get("loanRequests", { collateralTokenSymbol: "REP" });
     * => <Promise>
     *
     * @param resource
     * @param params
     * @returns {Promise}
     */
    get(resource, params) {        
        const query = params ? `?${this.parseQueryParams(params)}` : '';
        console.log("GET "+this.apiUrl+ "/"+ resource+query)
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${resource}${query}`)
                .then((response) => {
                 let json = response.json()
                 console.log("response: ", json);
                 resolve(json)
                })
                .catch((reason) => {
                    console.log("error: ", reason);
                    reject(reason)
                });
        });
    }

    /**
     * Allows deleting a record from the database.
     *
     * @param resource
     * @param id
     * @returns {Promise}
     */
    delete(resource, id) {
        let auth = localStorage.getItem('authorization');
        console.log("Api.delete - auth: ", auth);
        console.log("DELETE ", this.apiUrl, "/", resource, "/", id)
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${resource}/${id}`, { 
                    method: "DELETE",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": auth
                    },
                })
                .then((response) => resolve(response.json()))
                .catch((reason) => reject(reason));
        });
    }

    put(resource, id, data) {
        let auth = localStorage.getItem('authorization');
        console.log("Api.delete - auth: ", auth);
        console.log("PUT ", this.apiUrl, "/", resource, "/", id)
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${resource}/${id}`, { 
                    method: "PUT",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": auth
                    },
                    body: JSON.stringify(data),
                })
                .then((response) => resolve(response.json()))
                .catch((reason) => reject(reason));
        });
    }

    
    /**
     * Creates a new resource by posting the given data to the API.
     *
     * @param resource
     * @param data
     * @returns {Promise<any>}
     */
    create(resource = "loanRequests", data) {
        let auth = localStorage.getItem('authorization');
        console.log("Api.create - auth: ", auth);
        console.log("POST ", this.apiUrl, "/", resource, " data:", data)
        
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${resource}`, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": auth
                },
                body: JSON.stringify(data),
            })
                .then(async (response) => {
                    let auth = response.headers.get('authorization');   
                    if (auth) {
                        console.log("headers['authorization']: ", auth);
                        localStorage.setItem('authorization', auth);                        
                        console.log("localStorage.authorization: ", localStorage.getItem('authorization'));
                    }
                    

                    const json = await response.json();
                    resolve(json);
                })
                .catch((reason) => reject(reason));
        });
    }

    /**
     *
     * @example
     * parseQueryParams({ a: "a", b: "b" });
     * => "a=a&b=b"
     *
     * @param params
     * @returns {string}
     */
    parseQueryParams(params) {
        return Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&');
    }
}

export default Api;
