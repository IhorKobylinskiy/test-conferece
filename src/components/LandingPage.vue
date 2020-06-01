<template>
  <div class="container">
      <dnd-grid-container
        :cellSize="cellSizes"
        :maxRowCount="3"
        :maxColCount="3"
        :margin="0"
        :layout.sync="layoutJson">
          <dnd-grid-box 
            :boxId="stream.id"
            v-for="(stream, index) in activeStreams"
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
      },

      onLayoutUpdate (evt) {
          this.layout = evt.layout
      },

      createConnection(dummyDeviceId = false){
        this.connection = new RTCMultiConnection();

        this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

        this.connection.socketMessageEvent = 'video-conference-demo';
        this.connection.maxParticipantsAllowed = 9;
        this.connection.bandwidth = {
            audio: 50,  
            video: 256, 
            screen: 300 
        };
        
        this.connection.session = {
          audio: true,
          video: true
        };

        this.connection.onstream = (event) => {
            if(!this.activeStreams.some((activeStream)=>activeStream.id==event.streamid)){
              this.activeStreams.push({
                  id: event.streamid,
                  srcObject: event.stream,
                  muted: event.type === 'local'
              });
              
              this.layoutJson.push({
                id: event.streamid,
                streamid: event.streamid,
                hidden: false,
                pinned: false,
                position: {
                    x: this.activeStreams.length<=3?this.activeStreams.length-1:this.activeStreams.length%3-1,
                    y: this.activeStreams.length<=3?0:this.activeStreams.length%3,
                    w: 1, 
                    h: 0
                 }
              });
            }
        };

        this.connection.onstreamended = (event) => {
            this.leaveRoom(event.streamid);
        };
        console.log(dummyDeviceId);
        if(dummyDeviceId){
          this.connection.mediaConstraints.video.mandatory = {
              sourceId: dummyDeviceId
          };
          this.connection.applyConstraints({
              video: {
                width: 480,
                height: 480
              }
          });
        }
        this.joinRoom();
      }

    },
    
    mounted(){

      this.cellSizes = {
        w: window.innerWidth/3-20,
        h: window.innerHeight/3
      }
    
      navigator.mediaDevices.enumerateDevices().then((res)=>{
        let dummyDevice = res.find((device)=>device.label.indexOf('Dummy')!=-1);
        if(dummyDevice){
          this.createConnection(dummyDevice.deviceId);
        } else {
          this.createConnection();
        }
      }, (err)=>{console.log(err)})
     
      
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
  .dragSelector{

  }
  .dnd-grid-box video{
    max-width: 100%;
    vertical-align: top;
    object-fit: fill;
  }

</style>