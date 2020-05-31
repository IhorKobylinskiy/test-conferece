//import uuid from 'uuid';

const state = {
	streams: []
};

const actions = {
	ADD_STREAM({commit}, stream){
		commit('ADD_STREAM', stream)
	},
	REMOVE_STREAM({commit}, id){
		commit('REMOVE_STREAM', id)
	},
};

const mutations = {
	ADD_STREAM(state, stream){
		state.streams = [...state.streams, stream]
	},
	REMOVE_STREAM(state, id){
		state.streams = state.streams.filter(stream=>stream.id!==id)
	},
}

export default {
	state,
	actions,
	mutations,
}