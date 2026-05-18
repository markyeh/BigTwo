export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.CJTErb4g.js",app:"_app/immutable/entry/app.CjWuQfcp.js",imports:["_app/immutable/entry/start.CJTErb4g.js","_app/immutable/chunks/DsyUFaA2.js","_app/immutable/chunks/b4r3Wtc8.js","_app/immutable/chunks/YnDKQmeF.js","_app/immutable/chunks/Br0jxU9b.js","_app/immutable/entry/app.CjWuQfcp.js","_app/immutable/chunks/b4r3Wtc8.js","_app/immutable/chunks/CDLZjEkQ.js","_app/immutable/chunks/DQVfL-HD.js","_app/immutable/chunks/Br0jxU9b.js","_app/immutable/chunks/C9SAvz21.js","_app/immutable/chunks/YnDKQmeF.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
