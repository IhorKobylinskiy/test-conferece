<template>
  <div class="container">
      <dnd-grid-container
        :cellSize="cellSizes"
        :maxRowCount="3"
        :maxColCount="3"
        :layout.sync="layoutJson">
          <dnd-grid-box 
            :boxId="stream.id"
            v-for="(stream, index) in activeStreams"
            resizeVisible="true"
            v-bind:key="index"
          >
              <video-item
                  v-bind:stream="stream"
              >
              </video-item>
          </dnd-grid-box>
      </dnd-grid-container>
  </div>  
</template>

<script>
  //import {mapState} from 'vuex';
  //import Vue from 'vue';
  import * as io from 'socket.io-client';

  import RTCMultiConnection from 'rtcmulticonnection';
  import VideoItem  from './VideoItem.vue';

  import { Container, Box } from '@dattn/dnd-grid'
  import '@dattn/dnd-grid/dist/dnd-grid.css';

  require('adapterjs');

  window.io = io

  export default {
    components:{
      'video-item': VideoItem,
      DndGridContainer: Container,
      DndGridBox: Box,
    },
    data(){
      return {
        connection: null,
        activeStreams: [],
        layoutJson: [
            
        ],
        cellSizes: {
          w: 100,
          h: 100
        }
      }
    },
    methods: {
      
      joinRoom(){
        if(!this.connection) return;
        this.connection.openOrJoin('public-room-ihorkobylinskiy-demo-conference', (isRoomExist, roomid, error) => {
          console.log(error);
          if (isRoomExist === false && this.connection.isInitiator === true) {
              console.log(roomid);
          }
        });
      },

      leaveRoom(streamId){
        this.activeStreams = this.activeStreams.filter((activeStream)=>activeStream.id!=streamId);
        this.layoutJson = this.layoutJson.filter((item)=>item.streamid!=streamId);
        console.log(this.activeStreams, this.layoutJson)
      },

      onLayoutUpdate (evt) {
        console.log(evt);
          this.layout = evt.layout
      }

    },
    
    mounted(){

      this.cellSizes = {
        w: window.innerWidth/3,
        h: window.innerHeight/3
      }

      this.connection = new RTCMultiConnection();

      this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

      this.connection.socketMessageEvent = 'video-conference-demo';

      this.connection.session = {
          audio: true,
          video: true
      };

      this.connection.sdpConstraints.mandatory = {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
      };
      
      this.connection.candidates = {
         turn:     false,
         stun:    false,
         host:    true
      };
      //console.log(navigator.mediaDevices.enumerateDevices())
      this.connection.onstream = (event) => {
          console.log('add stream', event);
          this.activeStreams.push({
              id: event.streamid,
              srcObject: event.stream,
              muted: event.type === 'local'
          });
          this.layoutJson.push({
            id: event.streamid,
            streamid: event.streami,
            hidden: false,
            pinned: false,
            position: {
                x: 2,
                y: 0,
                w: 1, 
                h: 0
             }
          });
      };

      this.connection.onstreamended = (event) => {
          this.leaveRoom(event.streamid);
      };

      this.connection.mediaConstraints.video.optional = [{
          sourceId: 'c689efad5fbe6735b15eb336468673c6ceeb5c963173da859d196d40fc78e735'
      }];
      this.joinRoom();
    },
  }
</script>

<style>
  .container{
    background-color: #30336b;
    height: 100%;
  }
  .dnd-grid-container{
    min-height: 100vh !important;
  }
  .dnd-grid-box video{
      width: 100%;
      vertical-align: top;
      object-fit: fill;
    }
</style>