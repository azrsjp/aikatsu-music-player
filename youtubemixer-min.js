var MutekiTimer=(function(){var MutekiTimer=function(){initialize.apply(this,arguments)},$this=MutekiTimer.prototype;var TIMER_PATH=(function(){var BlobBuilder,URL,builder;BlobBuilder=self.WebKitBlobBuilder||self.MozBlobBuilder;URL=self.URL||self.webkitURL;if(BlobBuilder&&URL){builder=new BlobBuilder();builder.append("var timerId = 0;");builder.append("this.onmessage = function(e) {");builder.append("  if (timerId !== 0) {");builder.append("    clearInterval(timerId);");builder.append("    timerId = 0;");builder.append("  }");builder.append("  if (e.data > 0) {");builder.append("    timerId = setInterval(function() {");builder.append("        postMessage(null);");builder.append("    }, e.data);");builder.append("  }");builder.append("};");return URL.createObjectURL(builder.getBlob())}
return null}());var initialize=function(){if(TIMER_PATH){this._timer=new Worker(TIMER_PATH);this.isMuteki=!0}else{this._timer=null;this.isMuteki=!1}
this._timerId=0};$this.setInterval=function(func,interval){if(this._timer!==null){this._timer.onmessage=func;this._timer.postMessage(interval)}else{if(this._timerId!==0){clearInterval(this._timerId)}
this._timerId=setInterval(func,interval)}};$this.clearInterval=function(){if(this._timer!==null){this._timer.postMessage(0)}else if(this._timerId!==0){clearInterval(this._timerId);this._timerId=0}};return MutekiTimer}());var youtubeMixer=new function(){"use strict";var timer1=new MutekiTimer();var timer2=new MutekiTimer();this.version="0.11";var THIS=this;var container,overlay,progressBar;var videoPlaying,videoWaiting,videoFocused=null;var ar_video=[];var ar_videoEl=[];var playlist=[];var playlistPointer=0;var currentTime,endTime,playDuration;var ratio=16/9;var containerWidth,containerHeight;var isSwapping=!1;var timerProgress,timerVolume=null;var soundStep,volumeInc,volumeDec=0;var TRANSITION_TIME=2;var PROGRESSBAR_HEIGHT=10;var PROGRESSBAR_COLOR="#F00";var CROSSFADE_TIMER_STEP=80;var FLAG_PROGRESS_BAR=!0;var FLAG_AUDIO=!1;var FLAG_FULLPAGE=!0;var DEBUG=!1;var QUALITY="default";function getLastFrom(array){return array[array.length-1]}
function defVal(v,d){return typeof v!=='undefined'?v:d}
this.eventHandler=function(event,data)
{}
this.playlistPush=function(id,params)
{if(params==null)params={};var o={};o.id=id;o.start=params.start||0;o.playfor=params.playfor||0;o.end=params.end||0;o.once=params.once||!1;if(o.playfor>0&&o.end>0)
{console.warn("Can't have both 'playfor' and 'end' parameters set, ignoring 'playfor'");o.playfor=0}
playlist.push(o)}
this.onAPIReady=function()
{this.eventHandler("api-ok");loadNextVideo()}
this.init=function(params)
{if(params==null)params={};DEBUG=defVal(params.debug,DEBUG);QUALITY=defVal(params.quality,QUALITY);FLAG_AUDIO=defVal(params.audio,FLAG_AUDIO);FLAG_FULLPAGE=defVal(params.fullpage,FLAG_FULLPAGE);FLAG_PROGRESS_BAR=defVal(params.useProgressBar,FLAG_PROGRESS_BAR);if(FLAG_FULLPAGE)
{container=document.createElement("div");if(params.elementID){overlay=document.getElementById(params.elementID);overlay.parentNode.removeChild(overlay)}else{overlay=document.createElement("div")}
container.appendChild(overlay);container.style.position="absolute";container.style.margin=0;container.style.padding=0;container.style.overflow="hidden";overlay.style.position="relative";overlay.style.zIndex=4;overlay.style.overflowX="hidden";document.body.appendChild(container);window.onresize=updateResize}
else{container=document.getElementById(params.elementID);window.onresize=function(){};containerWidth=container.clientWidth;containerHeight=container.clientHeight}
if(FLAG_PROGRESS_BAR==!0)
{progressBar=document.createElement("div");progressBar.style.position="relative";progressBar.style.opacity=0.6;progressBar.style.height=PROGRESSBAR_HEIGHT+"px";progressBar.style.display="block";progressBar.style.backgroundColor=PROGRESSBAR_COLOR;progressBar.style.zIndex=3;progressBar.style.top=(containerHeight-PROGRESSBAR_HEIGHT)+"px";progressBar.style.left="0px";progressBar.style.width=0;document.body.appendChild(progressBar)}
else{updateProgressBarPercent=function(o){}}
updateResize();if(DEBUG){console.log("YoutubeMixer Parameters: --------------- ")
console.log("FLAG_PROGRESS_BAR",FLAG_PROGRESS_BAR);console.log("FLAG_AUDIO",FLAG_AUDIO);console.log("DEBUG",DEBUG);console.log("QUALITY",QUALITY);console.log("FLAG_FULLPAGE",FLAG_FULLPAGE);console.log("--------------------------")}
if(params.debugUI)
{console.log("Staring debug UI mode. ( no videos )");if(progressBar!=null)updateProgressBarPercent(90);THIS.eventHandler('api-loading');setTimeout(function(){THIS.eventHandler('api-ok')},700);setTimeout(function(){THIS.eventHandler('video-loading')},1000);setTimeout(function(){THIS.eventHandler('video-ready')},2000);setTimeout(function(){THIS.eventHandler('video-buffering')},3000);setTimeout(function(){THIS.eventHandler('video-play-first')},4000);setTimeout(function(){THIS.eventHandler('video-play')},4100);return}
updateResize();console.log("LOADING API");var tag=document.createElement('script');tag.src="http://www.youtube.com/iframe_api";var firstScriptTag=document.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);this.eventHandler('api-loading');soundStep=Math.ceil(100/((TRANSITION_TIME*1000)/CROSSFADE_TIMER_STEP))}
function updateResize()
{var r1,i;var targetRatio=containerWidth/containerHeight;if(overlay){overlay.style.width=containerWidth+"px";overlay.style.height=containerHeight+"px"}
if(!DEBUG){i=ar_videoEl.length;while(i-->0){if(targetRatio<ratio)
{r1=containerHeight*ratio;ar_video[i].setSize(Math.ceil(r1),containerHeight);ar_videoEl[i].style.left=-Math.ceil((r1-containerWidth)/2)+"px";ar_videoEl[i].style.top="0px"}
else{r1=containerWidth/ratio;ar_video[i].setSize(containerWidth,Math.ceil(r1));ar_videoEl[i].style.top=-Math.ceil((r1-containerHeight)/2)+"px";ar_videoEl[i].style.left="0px"}}}else{for(i=0;i<ar_video.length;i++){ar_videoEl[i].style.left=(420*i)+"px";ar_videoEl[i].style.top="20px";ar_video[i].setSize(400,260)}}
if(progressBar!=null)
{progressBar.style.top=(containerHeight-PROGRESSBAR_HEIGHT)+"px"}
THIS.eventHandler("resize",[containerWidth,containerHeight])}
function loadNextVideo()
{if(ar_video.length>=2)
{console.error("Cannot load a new video to play, There is already a video waiting to play.");return}
if(playlist.length==0)
{console.warn("No videos to play!");return}
if(playlistPointer>=playlist.length)playlistPointer=0;var videoInfoToLoad=playlist[playlistPointer++];if(videoInfoToLoad.once==!0){if(videoInfoToLoad.hasPlayed==!0)
{loadNextVideo();return}}
console.log("Loading video with id = "+videoInfoToLoad.id);loadVideo(videoInfoToLoad);videoInfoToLoad.hasPlayed=!0}
this.playNextVideo=function(){if(isSwapping==!0){console.warn("Was already swapping videos, returning.");return}
if(videoWaiting==null){console.error("Waiting video is not ready!!, returning.");return}
console.log("# Request to play next video.");THIS.eventHandler('swap-start');isSwapping=!0;videoWaiting.holdPlay=!1;videoWaiting.playVideo();THIS.eventHandler('video-buffering')}
function loadVideo(videoInfo)
{var tempElement=document.createElement('div');container.appendChild(tempElement);var video=new YT.Player(tempElement,{videoId:videoInfo.id,playerVars:{autoplay:1,controls:0,disablekb:1,iv_load_policy:3,showinfo:0,rel:0,modestbranding:1,start:videoInfo.start},events:{onReady:onPlayerReady,onStateChange:onPlayerStateChange,}});video.param=videoInfo;video.isBuffering=!1;video.firstPlay=!0;var el_video=video.getIframe();el_video.className="test";el_video.style.opacity=0.0;el_video.style.position="absolute";el_video.style.transition="opacity "+TRANSITION_TIME+"s ease-out";el_video.addEventListener('webkitTransitionEnd',onTransitionEnd);ar_video.push(video);ar_videoEl.push(el_video);THIS.eventHandler('video-loading',[videoInfo.id])}
function onPlayerReady(e)
{console.log("Video Player loaded, ready to play");var video=getLastFrom(ar_video);for(var i=0;i<ar_videoEl.length;i++){ar_videoEl[i].style.zIndex=i+1}
video.setVolume(0);video.setPlaybackQuality(QUALITY);if(DEBUG)updateResize();if(videoPlaying==null)
{console.log("videoPlaying set, id=",video.param.id);videoPlaying=video;videoPlaying.firstPlay=!0;video.playVideo();if(FLAG_AUDIO)video.setVolume(100);THIS.eventHandler('video-buffering')}
else{console.log("videoWaiting set, id=",video.param.id);videoWaiting=video;videoWaiting.holdPlay=!0;videoWaiting.playVideo();THIS.eventHandler('video-ready',[video.param.id])}}
function onPlayerStateChange(event)
{if(event.data==YT.PlayerState.PLAYING)
{if(videoPlaying.isBuffering==!0)
{THIS.eventHandler("video-play",[event.target.param.id]);videoPlaying.isBuffering=!1}
if(event.target.firstPlay==!1)
{return}
if(videoFocused==null)
{THIS.eventHandler('video-play-first')}
if(event.target.holdPlay==!0)
{event.target.holdPlay=!1;event.target.pauseVideo();return}
event.target.firstPlay=!1;console.log("+ Video Playing, id=",event.target.param.id);var video=getLastFrom(ar_video);var style=video.getIframe().style;updateResize();style.visibility="visible";style.opacity=1.0;var tt=video.getDuration();if(video.param.end>0)
endTime=video.param.end;else if(video.param.playfor>0)
endTime=video.param.start+video.param.playfor;else endTime=tt;if(endTime>tt){console.warn("Requested END time for video exceeds real end time, reseting value.");endTime=tt}
if(video.param.start>endTime){console.warn("Requested START time can't be higher than END TIME, reseting value.");video.param.start=0}
playDuration=endTime-video.param.start;currentTime=0;videoFocused=video;updateProgressBarPercent(0);if(FLAG_AUDIO)crossFadeSound();if(timerProgress==null)
{timerProgress=setInterval(onTimeCheck,100)}
THIS.eventHandler("video-play",[video.param.id]);THIS.eventHandler("playlist-update",[playlistPointer,playlist.length])}
else if(event.data==YT.PlayerState.BUFFERING)
{if(event.target==videoPlaying){videoPlaying.isBuffering=!0;console.log("# Video Buffering");THIS.eventHandler('video-buffering')}}}
function onTransitionEnd(event)
{console.log("- Video Transition end.");if(isSwapping==!0)
{if(timerVolume!=null){clearInterval(timerVolume);timerVolume=null}
var video=ar_video.shift();var video_el=ar_videoEl.shift();container.removeChild(video_el);video.destroy();videoPlaying=videoWaiting;videoWaiting=null;isSwapping=!1;if(FLAG_AUDIO)videoPlaying.setVolume(100);console.log("- Video Removed");THIS.eventHandler("swap-end")}
loadNextVideo()}
function onTimeCheck()
{if(videoPlaying.isBuffering==!0)return;currentTime+=0.1;updateProgressBarPercent(Math.ceil((currentTime/playDuration)*100));if((currentTime%1)<=0.1)
THIS.eventHandler("time-update",[Math.ceil(currentTime),playDuration]);if(isSwapping)return;if(currentTime+TRANSITION_TIME>playDuration)
{THIS.playNextVideo()}}
function crossFadeSound()
{if(videoWaiting==null)return;volumeInc=0;volumeDec=100;if(timerVolume!=null){console.warn("A crossfade is still in progress, skipping");return}
timerVolume=setInterval(function(){volumeInc+=soundStep;if(volumeInc>=100){volumeInc=100;clearInterval(timerVolume);timerVolume=null}
volumeDec=100-volumeInc;videoPlaying.setVolume(volumeDec);videoWaiting.setVolume(volumeInc)},CROSSFADE_TIMER_STEP)}
function updateProgressBarPercent(percent)
{progressBar.style.width=percent+"%"}
this.setAudio=function(state)
{FLAG_AUDIO=state;if(videoPlaying!=null){if(FLAG_AUDIO)
videoPlaying.setVolume(100);else videoPlaying.setVolume(0)}}
this.getAudio=function(){return FLAG_AUDIO}}
function onYouTubeIframeAPIReady(){console.log("API READY");youtubeMixer.onAPIReady()}