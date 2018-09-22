const defaultAPI = process.env.REACT_APP_API_SERVER || "/api";

class Api {
    constructor(apiUrl,token) {        
        this.apiUrl = apiUrl || defaultAPI;
    }
    setToken(token){
        this.token = token;
        return this;
    }
    processResponse(response){
        console.log(response)
        console.log(response.headers.get('Authorization'))
        //if(response.status === 403)
            //localStorage.removeItem('token');
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
        console.log("Token "+this.token)
        return new Promise((resolve, reject) => {
            let obj = {};
        
            if(this.token){
                let obj = {
                    method: 'GET',
                    headers: {
                        'Authorization': this.token,
                        'Content-Type': 'application/json'
                    }
                }
            }
            fetch(`${this.apiUrl}/${resource}${query}`,obj)
                .then((response) => {
                    this.processResponse(response);
                    if(response.ok){
                        let json = response.json()
                        //console.log("response: ", json);
                        resolve(json)
                    }
                    else{
                        reject(response)
                    }
                })
                .catch((reason) => {
                    //console.log("error: ", reason);
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
        console.log("DELETE ", this.apiUrl, "/", resource, "/", id)
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${resource}/${id}`, { method: "DELETE" })
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
        console.log("POST ", this.apiUrl, "/", resource, " data:", data)
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${resource}`, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': this.token,
                },
                body: JSON.stringify(data),
            })
            .then(async (response) => {
                this.processResponse(response);
                if(response.ok){
                    if(resource === "login"){
                        resolve(response);
                    }
                    else{
                        const json = await response.json();
                        resolve(json);    
                    }
                }
                else{
                    reject(response)
                }
                
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
