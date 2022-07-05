import {transformApiSiteData} from './helpers';

function setupGhostApi({siteUrl = window.location.origin, apiUrl, apiKey}) {
    const apiPath = 'members/api';

    function endpointFor({type, resource, params = ''}) {
        if (type === 'members') {
            return `${siteUrl.replace(/\/$/, '')}/${apiPath}/${resource}/${params}`;
        }
    }

    function contentEndpointFor({resource, params = ''}) {
        if (apiUrl && apiKey) {
            return `${apiUrl.replace(/\/$/, '')}/${resource}/?key=${apiKey}&limit=all${params}`;
        }
        return '';
    }

    function makeRequest({url, method = 'GET', headers = {}, credentials = undefined, body = undefined}) {
        const options = {
            method,
            headers,
            credentials,
            body
        };
        return fetch(url, options);
    }
    const api = {};

    api.site = {
        settings() {
            const url = contentEndpointFor({resource: 'settings'});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch site data');
                }
            });
        }
    };

    api.member = {
        identity() {
            const url = endpointFor({type: 'members', resource: 'session'});
            return makeRequest({
                url,
                credentials: 'same-origin'
            }).then(function (res) {
                if (!res.ok || res.status === 204) {
                    return null;
                }
                return res.text();
            });
        },

        sessionData() {
            const url = endpointFor({type: 'members', resource: 'member'});
            return makeRequest({
                url,
                credentials: 'same-origin'
            }).then(function (res) {
                if (!res.ok || res.status === 204) {
                    return null;
                }
                return res.json();
            });
        }
      
    };

    api.comments = {
        browse({page, postId}) {
            const filter = encodeURIComponent('post_id:' + postId);

            const url = endpointFor({type: 'members', resource: 'comments', params: `?limit=15&include=member&filter=${filter}&page=${page}`});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch comments');
                }
            });
        },
        add({comment}) {
            const body = {
                comments: [comment]
            };
            const url = endpointFor({type: 'members', resource: 'comments'});
            return makeRequest({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }).then(function (res) {
                if (res.ok) {
                    return 'Success';
                } else {
                    throw new Error('Failed to add comment');
                }
            });
        }
    };

    api.init = async () => {
        let [member] = await Promise.all([
            api.member.sessionData()
        ]);
        let site = {};
        let settings = {};

        try {
            settings = await api.site.settings();
            site = {
                ...settings
            };
        } catch (e) {
            // Ignore
        }
        site = transformApiSiteData({site});
        return {site, member};
    };

    return api;
}

export default setupGhostApi;