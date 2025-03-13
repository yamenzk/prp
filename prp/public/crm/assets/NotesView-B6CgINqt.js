var Ce=Object.defineProperty,Ee=Object.defineProperties;var Le=Object.getOwnPropertyDescriptors;var ce=Object.getOwnPropertySymbols;var De=Object.prototype.hasOwnProperty,Ne=Object.prototype.propertyIsEnumerable;var pe=(e,t,n)=>t in e?Ce(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Y=(e,t)=>{for(var n in t||(t={}))De.call(t,n)&&pe(e,n,t[n]);if(ce)for(var n of ce(t))Ne.call(t,n)&&pe(e,n,t[n]);return e},re=(e,t)=>Ee(e,Le(t));var B=(e,t,n)=>new Promise((r,a)=>{var i=d=>{try{o(n.next(d))}catch(p){a(p)}},s=d=>{try{o(n.throw(d))}catch(p){a(p)}},o=d=>d.done?r(d.value):Promise.resolve(d.value).then(i,s);o((n=n.apply(e,t)).next())});import{N as O,ad as Ae,bi as Me,aP as Ie,a8 as X,af as Q,aF as Be,bj as Ve,a4 as fe,j as l,k as u,F as L,H as V,q as x,S as de,A as b,l as h,x as S,O as F,t as T,M as je,Z as ye,bk as Re,L as N,R as Oe,B as _,z as C,g as A,D as v,C as z,Q as be,bc as $e,aq as Fe,Y as Ke,a5 as Ge,aQ as Ue,I as Z,aR as ae,aY as _e,r as w,a as D,e as q,K as P,b2 as Se,aV as oe,v as ke,ae as he,a1 as qe,_ as we,i as ze,bl as Je,bm as We,o as He,y as Ye,bn as me,bo as Xe,bp as Qe}from"./index-BXHSmgx-.js";import{u as Te,b as Ze,_ as et,a as tt}from"./CreateDialog-DeYsMeuo.js";var nt=({dt:e})=>`
.p-splitter {
    display: flex;
    flex-wrap: nowrap;
    border: 1px solid ${e("splitter.border.color")};
    background: ${e("splitter.background")};
    border-radius: ${e("border.radius.md")};
    color: ${e("splitter.color")};
}

.p-splitter-vertical {
    flex-direction: column;
}

.p-splitter-gutter {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    background: ${e("splitter.gutter.background")};
}

.p-splitter-gutter-handle {
    border-radius: ${e("splitter.handle.border.radius")};
    background: ${e("splitter.handle.background")};
    transition: outline-color ${e("splitter.transition.duration")}, box-shadow ${e("splitter.transition.duration")};
    outline-color: transparent;
}

.p-splitter-gutter-handle:focus-visible {
    box-shadow: ${e("splitter.handle.focus.ring.shadow")};
    outline: ${e("splitter.handle.focus.ring.width")} ${e("splitter.handle.focus.ring.style")} ${e("splitter.handle.focus.ring.color")};
    outline-offset: ${e("splitter.handle.focus.ring.offset")};
}

.p-splitter-horizontal.p-splitter-resizing {
    cursor: col-resize;
    user-select: none;
}

.p-splitter-vertical.p-splitter-resizing {
    cursor: row-resize;
    user-select: none;
}

.p-splitter-horizontal > .p-splitter-gutter > .p-splitter-gutter-handle {
    height: ${e("splitter.handle.size")};
    width: 100%;
}

.p-splitter-vertical > .p-splitter-gutter > .p-splitter-gutter-handle {
    width: ${e("splitter.handle.size")};
    height: 100%;
}

.p-splitter-horizontal > .p-splitter-gutter {
    cursor: col-resize;
}

.p-splitter-vertical > .p-splitter-gutter {
    cursor: row-resize;
}

.p-splitterpanel {
    flex-grow: 1;
    overflow: hidden;
}

.p-splitterpanel-nested {
    display: flex;
}

.p-splitterpanel .p-splitter {
    flex-grow: 1;
    border: 0 none;
}
`,it={root:function(t){var n=t.props;return["p-splitter p-component","p-splitter-"+n.layout]},gutter:"p-splitter-gutter",gutterHandle:"p-splitter-gutter-handle"},rt={root:function(t){var n=t.props;return[{display:"flex","flex-wrap":"nowrap"},n.layout==="vertical"?{"flex-direction":"column"}:""]}},at=O.extend({name:"splitter",style:nt,classes:it,inlineStyles:rt}),ot={name:"BaseSplitter",extends:F,props:{layout:{type:String,default:"horizontal"},gutterSize:{type:Number,default:4},stateKey:{type:String,default:null},stateStorage:{type:String,default:"session"},step:{type:Number,default:5}},style:at,provide:function(){return{$pcSplitter:this,$parentInstance:this}}};function ve(e){return dt(e)||ut(e)||st(e)||lt()}function lt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function st(e,t){if(e){if(typeof e=="string")return le(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?le(e,t):void 0}}function ut(e){if(typeof Symbol!="undefined"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function dt(e){if(Array.isArray(e))return le(e)}function le(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}var ct={name:"Splitter",extends:ot,inheritAttrs:!1,emits:["resizestart","resizeend","resize"],dragging:!1,mouseMoveListener:null,mouseUpListener:null,touchMoveListener:null,touchEndListener:null,size:null,gutterElement:null,startPos:null,prevPanelElement:null,nextPanelElement:null,nextPanelSize:null,prevPanelSize:null,panelSizes:null,prevPanelIndex:null,timer:null,data:function(){return{prevSize:null}},mounted:function(){this.initializePanels()},beforeUnmount:function(){this.clear(),this.unbindMouseListeners()},methods:{isSplitterPanel:function(t){return t.type.name==="SplitterPanel"},initializePanels:function(){var t=this;if(this.panels&&this.panels.length){var n=!1;if(this.isStateful()&&(n=this.restoreState()),!n){var r=ve(this.$el.children).filter(function(i){return i.getAttribute("data-pc-name")==="splitterpanel"}),a=[];this.panels.map(function(i,s){var o=i.props&&Ae(i.props.size)?i.props.size:null,d=o||100/t.panels.length;a[s]=d,r[s].style.flexBasis="calc("+d+"% - "+(t.panels.length-1)*t.gutterSize+"px)"}),this.panelSizes=a,this.prevSize=parseFloat(a[0]).toFixed(4)}}},onResizeStart:function(t,n,r){this.gutterElement=t.currentTarget||t.target.parentElement,this.size=this.horizontal?Me(this.$el):Ie(this.$el),r||(this.dragging=!0,this.startPos=this.layout==="horizontal"?t.pageX||t.changedTouches[0].pageX:t.pageY||t.changedTouches[0].pageY),this.prevPanelElement=this.gutterElement.previousElementSibling,this.nextPanelElement=this.gutterElement.nextElementSibling,r?(this.prevPanelSize=this.horizontal?X(this.prevPanelElement,!0):Q(this.prevPanelElement,!0),this.nextPanelSize=this.horizontal?X(this.nextPanelElement,!0):Q(this.nextPanelElement,!0)):(this.prevPanelSize=100*(this.horizontal?X(this.prevPanelElement,!0):Q(this.prevPanelElement,!0))/this.size,this.nextPanelSize=100*(this.horizontal?X(this.nextPanelElement,!0):Q(this.nextPanelElement,!0))/this.size),this.prevPanelIndex=n,this.$emit("resizestart",{originalEvent:t,sizes:this.panelSizes}),this.$refs.gutter[n].setAttribute("data-p-gutter-resizing",!0),this.$el.setAttribute("data-p-resizing",!0)},onResize:function(t,n,r){var a,i,s;r?this.horizontal?(i=100*(this.prevPanelSize+n)/this.size,s=100*(this.nextPanelSize-n)/this.size):(i=100*(this.prevPanelSize-n)/this.size,s=100*(this.nextPanelSize+n)/this.size):(this.horizontal?Be(this.$el)?a=(this.startPos-t.pageX)*100/this.size:a=(t.pageX-this.startPos)*100/this.size:a=(t.pageY-this.startPos)*100/this.size,i=this.prevPanelSize+a,s=this.nextPanelSize-a),this.validateResize(i,s)||(i=Math.min(Math.max(this.prevPanelMinSize,i),100-this.nextPanelMinSize),s=Math.min(Math.max(this.nextPanelMinSize,s),100-this.prevPanelMinSize)),this.prevPanelElement.style.flexBasis="calc("+i+"% - "+(this.panels.length-1)*this.gutterSize+"px)",this.nextPanelElement.style.flexBasis="calc("+s+"% - "+(this.panels.length-1)*this.gutterSize+"px)",this.panelSizes[this.prevPanelIndex]=i,this.panelSizes[this.prevPanelIndex+1]=s,this.prevSize=parseFloat(i).toFixed(4),this.$emit("resize",{originalEvent:t,sizes:this.panelSizes})},onResizeEnd:function(t){this.isStateful()&&this.saveState(),this.$emit("resizeend",{originalEvent:t,sizes:this.panelSizes}),this.$refs.gutter.forEach(function(n){return n.setAttribute("data-p-gutter-resizing",!1)}),this.$el.setAttribute("data-p-resizing",!1),this.clear()},repeat:function(t,n,r){this.onResizeStart(t,n,!0),this.onResize(t,r,!0)},setTimer:function(t,n,r){var a=this;this.timer||(this.timer=setInterval(function(){a.repeat(t,n,r)},40))},clearTimer:function(){this.timer&&(clearInterval(this.timer),this.timer=null)},onGutterKeyUp:function(){this.clearTimer(),this.onResizeEnd()},onGutterKeyDown:function(t,n){switch(t.code){case"ArrowLeft":{this.layout==="horizontal"&&this.setTimer(t,n,this.step*-1),t.preventDefault();break}case"ArrowRight":{this.layout==="horizontal"&&this.setTimer(t,n,this.step),t.preventDefault();break}case"ArrowDown":{this.layout==="vertical"&&this.setTimer(t,n,this.step*-1),t.preventDefault();break}case"ArrowUp":{this.layout==="vertical"&&this.setTimer(t,n,this.step),t.preventDefault();break}}},onGutterMouseDown:function(t,n){this.onResizeStart(t,n),this.bindMouseListeners()},onGutterTouchStart:function(t,n){this.onResizeStart(t,n),this.bindTouchListeners(),t.preventDefault()},onGutterTouchMove:function(t){this.onResize(t),t.preventDefault()},onGutterTouchEnd:function(t){this.onResizeEnd(t),this.unbindTouchListeners(),t.preventDefault()},bindMouseListeners:function(){var t=this;this.mouseMoveListener||(this.mouseMoveListener=function(n){return t.onResize(n)},document.addEventListener("mousemove",this.mouseMoveListener)),this.mouseUpListener||(this.mouseUpListener=function(n){t.onResizeEnd(n),t.unbindMouseListeners()},document.addEventListener("mouseup",this.mouseUpListener))},bindTouchListeners:function(){var t=this;this.touchMoveListener||(this.touchMoveListener=function(n){return t.onResize(n.changedTouches[0])},document.addEventListener("touchmove",this.touchMoveListener)),this.touchEndListener||(this.touchEndListener=function(n){t.resizeEnd(n),t.unbindTouchListeners()},document.addEventListener("touchend",this.touchEndListener))},validateResize:function(t,n){return!(t>100||t<0||n>100||n<0||this.prevPanelMinSize>t||this.nextPanelMinSize>n)},unbindMouseListeners:function(){this.mouseMoveListener&&(document.removeEventListener("mousemove",this.mouseMoveListener),this.mouseMoveListener=null),this.mouseUpListener&&(document.removeEventListener("mouseup",this.mouseUpListener),this.mouseUpListener=null)},unbindTouchListeners:function(){this.touchMoveListener&&(document.removeEventListener("touchmove",this.touchMoveListener),this.touchMoveListener=null),this.touchEndListener&&(document.removeEventListener("touchend",this.touchEndListener),this.touchEndListener=null)},clear:function(){this.dragging=!1,this.size=null,this.startPos=null,this.prevPanelElement=null,this.nextPanelElement=null,this.prevPanelSize=null,this.nextPanelSize=null,this.gutterElement=null,this.prevPanelIndex=null},isStateful:function(){return this.stateKey!=null},getStorage:function(){switch(this.stateStorage){case"local":return window.localStorage;case"session":return window.sessionStorage;default:throw new Error(this.stateStorage+' is not a valid value for the state storage, supported values are "local" and "session".')}},saveState:function(){Ve(this.panelSizes)&&this.getStorage().setItem(this.stateKey,JSON.stringify(this.panelSizes))},restoreState:function(){var t=this,n=this.getStorage(),r=n.getItem(this.stateKey);if(r){this.panelSizes=JSON.parse(r);var a=ve(this.$el.children).filter(function(i){return i.getAttribute("data-pc-name")==="splitterpanel"});return a.forEach(function(i,s){i.style.flexBasis="calc("+t.panelSizes[s]+"% - "+(t.panels.length-1)*t.gutterSize+"px)"}),!0}return!1},resetState:function(){this.initializePanels()}},computed:{panels:function(){var t=this,n=[];return this.$slots.default().forEach(function(r){t.isSplitterPanel(r)?n.push(r):r.children instanceof Array&&r.children.forEach(function(a){t.isSplitterPanel(a)&&n.push(a)})}),n},gutterStyle:function(){return this.horizontal?{width:this.gutterSize+"px"}:{height:this.gutterSize+"px"}},horizontal:function(){return this.layout==="horizontal"},getPTOptions:function(){var t;return{context:{nested:(t=this.$parentInstance)===null||t===void 0?void 0:t.nestedState}}},prevPanelMinSize:function(){var t=fe(this.panels[this.prevPanelIndex],"minSize");return this.panels[this.prevPanelIndex].props&&t?t:0},nextPanelMinSize:function(){var t=fe(this.panels[this.prevPanelIndex+1],"minSize");return this.panels[this.prevPanelIndex+1].props&&t?t:0}}},pt=["onMousedown","onTouchstart","onTouchmove","onTouchend"],ft=["aria-orientation","aria-valuenow","onKeydown"];function ht(e,t,n,r,a,i){return l(),u("div",b({class:e.cx("root"),style:e.sx("root"),"data-p-resizing":!1},e.ptmi("root",i.getPTOptions)),[(l(!0),u(L,null,V(i.panels,function(s,o){return l(),u(L,{key:o},[(l(),x(de(s),{tabindex:"-1"})),o!==i.panels.length-1?(l(),u("div",b({key:0,ref_for:!0,ref:"gutter",class:e.cx("gutter"),role:"separator",tabindex:"-1",onMousedown:function(p){return i.onGutterMouseDown(p,o)},onTouchstart:function(p){return i.onGutterTouchStart(p,o)},onTouchmove:function(p){return i.onGutterTouchMove(p,o)},onTouchend:function(p){return i.onGutterTouchEnd(p,o)},"data-p-gutter-resizing":!1},e.ptm("gutter")),[h("div",b({class:e.cx("gutterHandle"),tabindex:"0",style:[i.gutterStyle],"aria-orientation":e.layout,"aria-valuenow":a.prevSize,onKeyup:t[0]||(t[0]=function(){return i.onGutterKeyUp&&i.onGutterKeyUp.apply(i,arguments)}),onKeydown:function(p){return i.onGutterKeyDown(p,o)},ref_for:!0},e.ptm("gutterHandle")),null,16,ft)],16,pt)):S("",!0)],64)}),128))],16)}ct.render=ht;var mt={root:function(t){var n=t.instance;return["p-splitterpanel",{"p-splitterpanel-nested":n.isNested}]}},vt=O.extend({name:"splitterpanel",classes:mt}),gt={name:"BaseSplitterPanel",extends:F,props:{size:{type:Number,default:null},minSize:{type:Number,default:null}},style:vt,provide:function(){return{$pcSplitterPanel:this,$parentInstance:this}}},yt={name:"SplitterPanel",extends:gt,inheritAttrs:!1,data:function(){return{nestedState:null}},computed:{isNested:function(){var t=this;return this.$slots.default().some(function(n){return t.nestedState=n.type.name==="Splitter"?!0:null,t.nestedState})},getPTOptions:function(){return{context:{nested:this.isNested}}}}};function bt(e,t,n,r,a,i){return l(),u("div",b({ref:"container",class:e.cx("root")},e.ptmi("root",i.getPTOptions)),[T(e.$slots,"default")],16)}yt.render=bt;var xe={name:"PlusIcon",extends:je};function $t(e,t,n,r,a,i){return l(),u("svg",b({width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e.pti()),t[0]||(t[0]=[h("path",{d:"M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z",fill:"currentColor"},null,-1)]),16)}xe.render=$t;var St=({dt:e})=>`
.p-inputgroup,
.p-inputgroup .p-iconfield,
.p-inputgroup .p-floatlabel,
.p-inputgroup .p-iftalabel {
    display: flex;
    align-items: stretch;
    width: 100%;
}

.p-inputgroup .p-inputtext,
.p-inputgroup .p-inputwrapper {
    flex: 1 1 auto;
    width: 1%;
}

.p-inputgroupaddon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${e("inputgroup.addon.padding")};
    background: ${e("inputgroup.addon.background")};
    color: ${e("inputgroup.addon.color")};
    border-block-start: 1px solid ${e("inputgroup.addon.border.color")};
    border-block-end: 1px solid ${e("inputgroup.addon.border.color")};
    min-width: ${e("inputgroup.addon.min.width")};
}

.p-inputgroupaddon:first-child,
.p-inputgroupaddon + .p-inputgroupaddon {
    border-inline-start: 1px solid ${e("inputgroup.addon.border.color")};
}

.p-inputgroupaddon:last-child {
    border-inline-end: 1px solid ${e("inputgroup.addon.border.color")};
}

.p-inputgroupaddon:has(.p-button) {
    padding: 0;
    overflow: hidden;
}

.p-inputgroupaddon .p-button {
    border-radius: 0;
}

.p-inputgroup > .p-component,
.p-inputgroup > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iconfield > .p-component,
.p-inputgroup > .p-floatlabel > .p-component,
.p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel > .p-component,
.p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
    border-radius: 0;
    margin: 0;
}

.p-inputgroupaddon:first-child,
.p-inputgroup > .p-component:first-child,
.p-inputgroup > .p-inputwrapper:first-child > .p-component,
.p-inputgroup > .p-iconfield:first-child > .p-component,
.p-inputgroup > .p-floatlabel:first-child > .p-component,
.p-inputgroup > .p-floatlabel:first-child > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel:first-child > .p-component,
.p-inputgroup > .p-iftalabel:first-child > .p-inputwrapper > .p-component {
    border-start-start-radius: ${e("inputgroup.addon.border.radius")};
    border-end-start-radius: ${e("inputgroup.addon.border.radius")};
}

.p-inputgroupaddon:last-child,
.p-inputgroup > .p-component:last-child,
.p-inputgroup > .p-inputwrapper:last-child > .p-component,
.p-inputgroup > .p-iconfield:last-child > .p-component,
.p-inputgroup > .p-floatlabel:last-child > .p-component,
.p-inputgroup > .p-floatlabel:last-child > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel:last-child > .p-component,
.p-inputgroup > .p-iftalabel:last-child > .p-inputwrapper > .p-component {
    border-start-end-radius: ${e("inputgroup.addon.border.radius")};
    border-end-end-radius: ${e("inputgroup.addon.border.radius")};
}

.p-inputgroup .p-component:focus,
.p-inputgroup .p-component.p-focus,
.p-inputgroup .p-inputwrapper-focus,
.p-inputgroup .p-component:focus ~ label,
.p-inputgroup .p-component.p-focus ~ label,
.p-inputgroup .p-inputwrapper-focus ~ label {
    z-index: 1;
}

.p-inputgroup > .p-button:not(.p-button-icon-only) {
    width: auto;
}

.p-inputgroup .p-iconfield + .p-iconfield .p-inputtext {
    border-inline-start: 0;
}
`,kt={root:"p-inputgroup"},wt=O.extend({name:"inputgroup",style:St,classes:kt}),zt={name:"BaseInputGroup",extends:F,style:wt,provide:function(){return{$pcInputGroup:this,$parentInstance:this}}},se={name:"InputGroup",extends:zt,inheritAttrs:!1};function Tt(e,t,n,r,a,i){return l(),u("div",b({class:e.cx("root")},e.ptmi("root")),[T(e.$slots,"default")],16)}se.render=Tt;var xt={root:"p-inputgroupaddon"},Pt=O.extend({name:"inputgroupaddon",classes:xt}),Ct={name:"BaseInputGroupAddon",extends:F,style:Pt,provide:function(){return{$pcInputGroupAddon:this,$parentInstance:this}}},ue={name:"InputGroupAddon",extends:Ct,inheritAttrs:!1};function Et(e,t,n,r,a,i){return l(),u("div",b({class:e.cx("root")},e.ptmi("root")),[T(e.$slots,"default")],16)}ue.render=Et;var Lt=({dt:e})=>`
.p-panel {
    border: 1px solid ${e("panel.border.color")};
    border-radius: ${e("panel.border.radius")};
    background: ${e("panel.background")};
    color: ${e("panel.color")};
}

.p-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${e("panel.header.padding")};
    background: ${e("panel.header.background")};
    color: ${e("panel.header.color")};
    border-style: solid;
    border-width: ${e("panel.header.border.width")};
    border-color: ${e("panel.header.border.color")};
    border-radius: ${e("panel.header.border.radius")};
}

.p-panel-toggleable .p-panel-header {
    padding: ${e("panel.toggleable.header.padding")};
}

.p-panel-title {
    line-height: 1;
    font-weight: ${e("panel.title.font.weight")};
}

.p-panel-content {
    padding: ${e("panel.content.padding")};
}

.p-panel-footer {
    padding: ${e("panel.footer.padding")};
}
`,Dt={root:function(t){var n=t.props;return["p-panel p-component",{"p-panel-toggleable":n.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",content:"p-panel-content",footer:"p-panel-footer"},Nt=O.extend({name:"panel",style:Lt,classes:Dt}),At={name:"BasePanel",extends:F,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:Nt,provide:function(){return{$pcPanel:this,$parentInstance:this}}},Mt={name:"Panel",extends:At,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{d_collapsed:this.collapsed}},watch:{collapsed:function(t){this.d_collapsed=t}},methods:{toggle:function(t){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:t,value:this.d_collapsed})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&(this.toggle(t),t.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header},dataP:function(){return ye({toggleable:this.toggleable})}},components:{PlusIcon:xe,MinusIcon:Re,Button:N},directives:{ripple:Oe}},It=["data-p"],Bt=["data-p"],Vt=["id"],jt=["id","aria-labelledby"];function Rt(e,t,n,r,a,i){var s=_("Button");return l(),u("div",b({class:e.cx("root"),"data-p":i.dataP},e.ptmi("root")),[h("div",b({class:e.cx("header"),"data-p":i.dataP},e.ptm("header")),[T(e.$slots,"header",{id:e.$id+"_header",class:A(e.cx("title"))},function(){return[e.header?(l(),u("span",b({key:0,id:e.$id+"_header",class:e.cx("title")},e.ptm("title")),C(e.header),17,Vt)):S("",!0)]}),h("div",b({class:e.cx("headerActions")},e.ptm("headerActions")),[T(e.$slots,"icons"),e.toggleable?T(e.$slots,"togglebutton",{key:0,collapsed:a.d_collapsed,toggleCallback:function(d){return i.toggle(d)},keydownCallback:function(d){return i.onKeyDown(d)}},function(){return[v(s,b({id:e.$id+"_header",class:e.cx("pcToggleButton"),"aria-label":i.buttonAriaLabel,"aria-controls":e.$id+"_content","aria-expanded":!a.d_collapsed,unstyled:e.unstyled,onClick:t[0]||(t[0]=function(o){return i.toggle(e.event)}),onKeydown:t[1]||(t[1]=function(o){return i.onKeyDown(e.event)})},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:z(function(o){return[T(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:a.d_collapsed},function(){return[(l(),x(de(a.d_collapsed?"PlusIcon":"MinusIcon"),b({class:o.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","pt"])]}):S("",!0)],16)],16,Bt),v(Fe,b({name:"p-toggleable-content"},e.ptm("transition")),{default:z(function(){return[be(h("div",b({id:e.$id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":e.$id+"_header"},e.ptm("contentContainer")),[h("div",b({class:e.cx("content")},e.ptm("content")),[T(e.$slots,"default")],16),e.$slots.footer?(l(),u("div",b({key:0,class:e.cx("footer")},e.ptm("footer")),[T(e.$slots,"footer")],16)):S("",!0)],16,jt),[[$e,!a.d_collapsed]])]}),_:3},16)],16,It)}Mt.render=Rt;var Ot={root:function(t){var n=t.instance;return["p-tabpanel",{"p-tabpanel-active":n.active}]}},Ft=O.extend({name:"tabpanel",classes:Ot}),Kt={name:"BaseTabPanel",extends:F,props:{value:{type:[String,Number],default:void 0},as:{type:[String,Object],default:"DIV"},asChild:{type:Boolean,default:!1},header:null,headerStyle:null,headerClass:null,headerProps:null,headerActionProps:null,contentStyle:null,contentClass:null,contentProps:null,disabled:Boolean},style:Ft,provide:function(){return{$pcTabPanel:this,$parentInstance:this}}},Pe={name:"TabPanel",extends:Kt,inheritAttrs:!1,inject:["$pcTabs"],computed:{active:function(){var t;return Ke((t=this.$pcTabs)===null||t===void 0?void 0:t.d_value,this.value)},id:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.id,"_tabpanel_").concat(this.value)},ariaLabelledby:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.id,"_tab_").concat(this.value)},attrs:function(){return b(this.a11yAttrs,this.ptmi("root",this.ptParams))},a11yAttrs:function(){var t;return{id:this.id,tabindex:(t=this.$pcTabs)===null||t===void 0?void 0:t.tabindex,role:"tabpanel","aria-labelledby":this.ariaLabelledby,"data-pc-name":"tabpanel","data-p-active":this.active}},ptParams:function(){return{context:{active:this.active}}}}};function Gt(e,t,n,r,a,i){var s,o;return i.$pcTabs?(l(),u(L,{key:1},[e.asChild?T(e.$slots,"default",{key:1,class:A(e.cx("root")),active:i.active,a11yAttrs:i.a11yAttrs}):(l(),u(L,{key:0},[!((s=i.$pcTabs)!==null&&s!==void 0&&s.lazy)||i.active?be((l(),x(de(e.as),b({key:0,class:e.cx("root")},i.attrs),{default:z(function(){return[T(e.$slots,"default")]}),_:3},16,["class"])),[[$e,(o=i.$pcTabs)!==null&&o!==void 0&&o.lazy?!0:i.active]]):S("",!0)],64))],64)):T(e.$slots,"default",{key:0})}Pe.render=Gt;var Ut=({dt:e})=>`
.p-timeline {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    direction: ltr;
}

.p-timeline-left .p-timeline-event-opposite {
    text-align: right;
}

.p-timeline-left .p-timeline-event-content {
    text-align: left;
}

.p-timeline-right .p-timeline-event {
    flex-direction: row-reverse;
}

.p-timeline-right .p-timeline-event-opposite {
    text-align: left;
}

.p-timeline-right .p-timeline-event-content {
    text-align: right;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) {
    flex-direction: row-reverse;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-opposite {
    text-align: right;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-content {
    text-align: left;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) .p-timeline-event-opposite {
    text-align: left;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) .p-timeline-event-content {
    text-align: right;
}

.p-timeline-vertical .p-timeline-event-opposite,
.p-timeline-vertical .p-timeline-event-content {
    padding: ${e("timeline.vertical.event.content.padding")};
}

.p-timeline-vertical .p-timeline-event-connector {
    width: ${e("timeline.event.connector.size")};
}

.p-timeline-event {
    display: flex;
    position: relative;
    min-height: ${e("timeline.event.min.height")};
}

.p-timeline-event:last-child {
    min-height: 0;
}

.p-timeline-event-opposite {
    flex: 1;
}

.p-timeline-event-content {
    flex: 1;
}

.p-timeline-event-separator {
    flex: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.p-timeline-event-marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    align-self: baseline;
    border-width: ${e("timeline.event.marker.border.width")};
    border-style: solid;
    border-color: ${e("timeline.event.marker.border.color")};
    border-radius: ${e("timeline.event.marker.border.radius")};
    width: ${e("timeline.event.marker.size")};
    height: ${e("timeline.event.marker.size")};
    background: ${e("timeline.event.marker.background")};
}

.p-timeline-event-marker::before {
    content: " ";
    border-radius: ${e("timeline.event.marker.content.border.radius")};
    width: ${e("timeline.event.marker.content.size")};
    height:${e("timeline.event.marker.content.size")};
    background: ${e("timeline.event.marker.content.background")};
}

.p-timeline-event-marker::after {
    content: " ";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${e("timeline.event.marker.border.radius")};
    box-shadow: ${e("timeline.event.marker.content.inset.shadow")};
}

.p-timeline-event-connector {
    flex-grow: 1;
    background: ${e("timeline.event.connector.color")};
}

.p-timeline-horizontal {
    flex-direction: row;
}

.p-timeline-horizontal .p-timeline-event {
    flex-direction: column;
    flex: 1;
}

.p-timeline-horizontal .p-timeline-event:last-child {
    flex: 0;
}

.p-timeline-horizontal .p-timeline-event-separator {
    flex-direction: row;
}

.p-timeline-horizontal .p-timeline-event-connector {
    width: 100%;
    height: ${e("timeline.event.connector.size")};
}

.p-timeline-horizontal .p-timeline-event-opposite,
.p-timeline-horizontal .p-timeline-event-content {
    padding: ${e("timeline.horizontal.event.content.padding")};
}

.p-timeline-horizontal.p-timeline-alternate .p-timeline-event:nth-child(even) {
    flex-direction: column-reverse;
}

.p-timeline-bottom .p-timeline-event {
    flex-direction: column-reverse;
}
`,_t={root:function(t){var n=t.props;return["p-timeline p-component","p-timeline-"+n.align,"p-timeline-"+n.layout]},event:"p-timeline-event",eventOpposite:"p-timeline-event-opposite",eventSeparator:"p-timeline-event-separator",eventMarker:"p-timeline-event-marker",eventConnector:"p-timeline-event-connector",eventContent:"p-timeline-event-content"},qt=O.extend({name:"timeline",style:Ut,classes:_t}),Jt={name:"BaseTimeline",extends:F,props:{value:null,align:{mode:String,default:"left"},layout:{mode:String,default:"vertical"},dataKey:null},style:qt,provide:function(){return{$pcTimeline:this,$parentInstance:this}}};function J(e){"@babel/helpers - typeof";return J=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},J(e)}function ge(e,t,n){return(t=Wt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Wt(e){var t=Ht(e,"string");return J(t)=="symbol"?t:t+""}function Ht(e,t){if(J(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(J(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Yt={name:"Timeline",extends:Jt,inheritAttrs:!1,methods:{getKey:function(t,n){return this.dataKey?Ge(t,this.dataKey):n},getPTOptions:function(t,n){return this.ptm(t,{context:{index:n,count:this.value.length}})}},computed:{dataP:function(){return ye(ge(ge({},this.layout,this.layout),this.align,this.align))}}},Xt=["data-p"],Qt=["data-p"],Zt=["data-p"],en=["data-p"],tn=["data-p"],nn=["data-p"],rn=["data-p"];function an(e,t,n,r,a,i){return l(),u("div",b({class:e.cx("root")},e.ptmi("root"),{"data-p":i.dataP}),[(l(!0),u(L,null,V(e.value,function(s,o){return l(),u("div",b({key:i.getKey(s,o),class:e.cx("event"),ref_for:!0},i.getPTOptions("event",o),{"data-p":i.dataP}),[h("div",b({class:e.cx("eventOpposite",{index:o}),ref_for:!0},i.getPTOptions("eventOpposite",o),{"data-p":i.dataP}),[T(e.$slots,"opposite",{item:s,index:o})],16,Zt),h("div",b({class:e.cx("eventSeparator"),ref_for:!0},i.getPTOptions("eventSeparator",o),{"data-p":i.dataP}),[T(e.$slots,"marker",{item:s,index:o},function(){return[h("div",b({class:e.cx("eventMarker"),ref_for:!0},i.getPTOptions("eventMarker",o),{"data-p":i.dataP}),null,16,tn)]}),o!==e.value.length-1?T(e.$slots,"connector",{key:0,item:s,index:o},function(){return[h("div",b({class:e.cx("eventConnector"),ref_for:!0},i.getPTOptions("eventConnector",o),{"data-p":i.dataP}),null,16,nn)]}):S("",!0)],16,en),h("div",b({class:e.cx("eventContent"),ref_for:!0},i.getPTOptions("eventContent",o),{"data-p":i.dataP}),[T(e.$slots,"content",{item:s,index:o})],16,rn)],16,Qt)}),128))],16,Xt)}Yt.render=an;const ei=Ue("versions",{state:()=>({versionList:null,currentVersion:null,currentVersionResource:null,timelineEvents:[],refDoctype:null,refDocname:null,refDocument:null,refDocumentResource:null,isTimelineLoading:!1}),getters:{versions:e=>{var t;return((t=e.versionList)==null?void 0:t.data)||[]},isLoading:e=>{var t,n;return((n=(t=e.versionList)==null?void 0:t.list)==null?void 0:n.loading)||!1},hasError:e=>{var t,n;return!!((n=(t=e.versionList)==null?void 0:t.list)!=null&&n.error)},errorMessage:e=>{var t,n,r;return((r=(n=(t=e.versionList)==null?void 0:t.list)==null?void 0:n.error)==null?void 0:r.message)||""},formattedTimelineEvents:e=>e.timelineEvents.map(t=>({date:t.date,status:t.content,icon:t.icon||"pi pi-calendar",color:t.color||null,user:t.user}))},actions:{initVersionList(){const e=Z();return!this.versionList&&e.socket?(this.versionList=ae({doctype:"Version",fields:["*"],orderBy:"creation desc",start:0,pageLength:50,cache:"prp:version",auto:!0,transform(t){return t},onSuccess(t){},onError(t){console.error("Error loading versions data:",t)}},e.socket),this.setupRealtimeListeners(e.socket)):this.versionList||console.warn("Cannot initialize version list: Socket not available"),this.versionList},setupRealtimeListeners(e){if(!e){console.warn("Cannot setup realtime listeners: Socket not available");return}e.on("prp:refetch_resource",t=>{t.cache_key==="prp:version"&&(t.event==="list_update"||t.event==="doc_update")&&(this.refetchVersions(),this.refDoctype&&this.refDocname&&this.loadDocumentTimeline(this.refDoctype,this.refDocname))})},refetchVersions(){return B(this,null,function*(){if(this.versionList)try{return yield this.versionList.reload(),this.versions}catch(e){console.error("Error refetching versions:",e)}return null})},fetchDocumentVersions(e,t){return B(this,null,function*(){if(this.refDoctype=e,this.refDocname=t,!Z().socket)return console.warn("Socket not available for fetching versions"),[];if(this.versionList||this.initVersionList(),this.versionList){this.versionList.update({filters:{ref_doctype:e,docname:t}});try{return yield this.versionList.reload(),this.versions}catch(r){return console.error(`Error fetching versions for ${e}/${t}:`,r),[]}}return[]})},parseVersionData(e){try{return typeof e=="string"&&(e=JSON.parse(e)),{added:e.added||[],changed:e.changed||[],removed:e.removed||[],rowChanged:e.row_changed||[]}}catch(t){return console.error("Error parsing version data:",t),{added:[],changed:[],removed:[],rowChanged:[]}}},formatChanges(e){const t=[];return e.changed.length>0&&e.changed.forEach(n=>{const[r,a,i]=n;t.push(`Changed ${r} from "${a}" to "${i}"`)}),e.added.length>0&&e.added.forEach(n=>{const[r,a]=n,i=this.getRowDescription(a);t.push(`Added a new ${r} entry: ${i}`)}),e.removed.length>0&&e.removed.forEach(n=>{const[r,a]=n,i=this.getRowDescription(a);t.push(`Removed ${r} entry: ${i}`)}),e.rowChanged.length>0&&e.rowChanged.forEach(n=>{t.push("Updated a row in a child table")}),t},getRowDescription(e){if(!e)return"Unknown";const t=["name","title","type","value","description"];for(const r of t)if(e[r])return`${r}: ${e[r]}`;const n=Object.entries(e).filter(([r])=>!r.startsWith("__")&&!["creation","modified","modified_by","owner","docstatus","idx","doctype"].includes(r));return n.length>0?n.slice(0,2).map(([r,a])=>`${r}: ${a}`).join(", "):`ID: ${e.name||"New"}`},fetchReferenceDocument(e,t){return B(this,null,function*(){try{const n=Z();if(!n.socket)return console.warn("Socket not available for fetching reference document"),null;const r=ae({doctype:e,fields:["name","creation","owner"],filters:{name:t},pageLength:1,auto:!1},n.socket);yield r.reload();const a=r.data||[];return a.length>0?a[0]:(console.warn(`Document ${e}/${t} not found`),null)}catch(n){return console.error(`Error fetching reference document ${e}/${t}:`,n),null}})},loadDocumentTimeline(e,t){return B(this,null,function*(){this.isTimelineLoading=!0,this.timelineEvents=[];try{const n=yield this.fetchReferenceDocument(e,t);if(n){const a=new Date(n.creation);this.timelineEvents.push({date:this.formatDate(a),content:`Created ${e}`,icon:"pi pi-plus-circle",color:"#171717",user:n.owner,timestamp:a.getTime()})}const r=yield this.fetchDocumentVersions(e,t);for(const a of r){const i=this.parseVersionData(a.data),s=this.formatChanges(i);if(s.length>0){const o=new Date(a.creation);s.forEach(d=>{this.timelineEvents.push({date:this.formatDate(o),content:d,icon:this.getChangeIcon(i),color:this.getChangeColor(i),user:a.owner,timestamp:o.getTime()})})}}return this.timelineEvents.sort((a,i)=>i.timestamp-a.timestamp),this.timelineEvents}catch(n){return console.error(`Error loading timeline for ${e}/${t}:`,n),[]}finally{this.isTimelineLoading=!1}})},loadRelatedDocumentsTimeline(e,t,n){return B(this,null,function*(){yield this.loadDocumentTimeline(e,t);for(const r of n){const a=yield this.fetchRelatedDocuments(r.doctype,r.linkField,t);for(const i of a){const o=(yield this.loadDocumentTimeline(r.doctype,i.name,!1)).map(d=>re(Y({},d),{content:`[${r.doctype}: ${i[r.labelField]||i.name}] ${d.content}`,relatedDoc:i.name,relatedDoctype:r.doctype}));this.timelineEvents=[...this.timelineEvents,...o]}}return this.timelineEvents.sort((r,a)=>a.timestamp-r.timestamp),this.timelineEvents})},fetchRelatedDocuments(e,t,n){return B(this,null,function*(){const r=Z();if(!r.socket)return console.warn("Socket not available for fetching related documents"),[];try{const a=ae({doctype:e,fields:["*"],filters:{[t]:n},orderBy:"creation desc",pageLength:100},r.socket);return yield a.reload(),a.data||[]}catch(a){return console.error(`Error fetching related ${e} documents:`,a),[]}})},formatDate(e,t=!1){if(e instanceof Date||(e=new Date(e)),t){const n={weekday:"long",day:"numeric",month:"short",year:"numeric"},r=e.toLocaleDateString("en-AE",n),a=_e(e,"hh:mm a");return`${r} • ${a}`}return e.toLocaleString()},getChangeIcon(e){return e.added.length>0?"pi pi-plus":e.removed.length>0?"pi pi-minus":e.changed.length>0?"pi pi-pencil":"pi pi-sync"},getChangeColor(e){return e.added.length>0||e.removed.length>0||e.changed.length>0?"#171717":"#9E9E9E"}}}),ti={__name:"EditDialog",props:{visible:{type:Boolean,required:!0},fieldName:{type:String,required:!1,default:""},fieldType:{type:String,default:"text"},value:{type:[String,Number,Boolean,Object,Date],default:null},title:{type:String,default:""},options:{type:Array,default:()=>[]},validation:{type:[Function,Object,String],default:null},doctype:{type:String,default:""},icon:{type:String,default:""},readonly:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},additionalProps:{type:Object,default:()=>({})}},emits:["update:visible","save"],setup(e,{emit:t}){const n=e,r=t,{validateField:a}=Te(),i=w(s(n.value,n.fieldType));w("");function s(c,m){return m==="boolean"?c===!0||c===1:c}const o=D(()=>{const c=n.additionalProps||{};return n.fieldType==="currency"&&!c.currency?re(Y({},c),{currency:"AED",locale:"en-AE"}):c}),d=D(()=>a(i.value,n.validation)===!0);q(()=>n.value,c=>{i.value=s(c,n.fieldType)}),q(()=>n.visible,c=>{c&&(i.value=s(n.value,n.fieldType))}),q(()=>n.fieldType,c=>{i.value=s(n.value,c)});function p(){if(!d.value)return;let c=i.value;n.fieldType==="boolean"&&(c=c===!0?1:0),r("save",{fieldName:n.fieldName,value:c}),r("update:visible",!1)}return(c,m)=>(l(),x(P(Se),{visible:e.visible,"onUpdate:visible":m[2]||(m[2]=$=>c.$emit("update:visible",$)),modal:"",header:e.title||"Update Field",style:{width:"30rem"}},{footer:z(()=>[v(P(N),{label:"Cancel",text:"",onClick:m[1]||(m[1]=$=>c.$emit("update:visible",!1))}),v(P(N),{label:"Save",onClick:p,disabled:!d.value},null,8,["disabled"])]),default:z(()=>[v(Ze,b({modelValue:i.value,"onUpdate:modelValue":m[0]||(m[0]=$=>i.value=$),type:e.fieldType,label:e.title,id:e.fieldName,validation:e.validation,options:e.options,doctype:e.doctype,icon:e.icon,disabled:e.readonly||e.disabled},o.value),null,16,["modelValue","type","label","id","validation","options","doctype","icon","disabled"])]),_:1},8,["visible","header"]))}},on={class:"p-fluid"},ln={class:"mb-4"},sn={class:"font-bold mb-2"},un={__name:"DeleteDialog",props:{visible:{type:Boolean,default:!1},title:{type:String,default:"Delete Confirmation"},message:{type:String,default:"This action cannot be undone. Are you sure you want to proceed?"},confirmField:{type:String,default:""},confirmValue:{type:String,default:""},confirmFieldLabel:{type:String,default:"name"},deleteButtonLabel:{type:String,default:"Delete"}},emits:["update:visible","confirm","cancel"],setup(e,{emit:t}){const n=e,r=t,a=w(""),i=D(()=>n.visible);q(()=>n.visible,p=>{p&&(a.value="")});const s=D(()=>n.confirmField&&n.confirmValue?a.value!==n.confirmValue:!1),o=()=>{r("confirm"),r("update:visible",!1)},d=()=>{r("cancel"),r("update:visible",!1)};return(p,c)=>{const m=oe,$=N,I=Se;return l(),x(I,{visible:i.value,"onUpdate:visible":c[1]||(c[1]=j=>i.value=j),header:e.title||"Delete Confirmation",modal:"",style:{width:"30rem"}},{footer:z(()=>[v($,{label:"Cancel",onClick:d,text:""}),v($,{label:e.deleteButtonLabel||"Delete",severity:"danger",disabled:s.value,onClick:o},null,8,["label","disabled"])]),default:z(()=>[h("div",on,[h("p",ln,C(e.message||"Are you sure you want to delete this item?"),1),e.confirmField&&e.confirmValue?(l(),u(L,{key:0},[h("p",sn,C(e.confirmValue),1),v(m,{modelValue:a.value,"onUpdate:modelValue":c[0]||(c[0]=j=>a.value=j),class:"w-full",placeholder:`Type ${e.confirmFieldLabel||"name"} to confirm`},null,8,["modelValue","placeholder"])],64)):S("",!0)])]),_:1},8,["visible","header"])}}},dn={class:"flex items-center gap-1 mb-1"},cn={key:0,class:"text-base"},pn={key:0},fn={class:"text-sm"},hn={class:"flex items-center gap-2"},mn=["for"],vn={key:1,class:"flex items-center"},gn=300,yn={__name:"EditableField",props:{label:String,value:[String,Number,Boolean],fieldName:String,fieldType:{type:String,default:"text"},severity:{type:String,default:"secondary"},variant:{type:String,default:"text"},readonly:{type:Boolean,default:!1},icon:{type:String,default:""},directToggle:{type:Boolean,default:!0}},emits:["edit","toggle-boolean"],setup(e,{emit:t}){const n=e,r=t,a=w(0),i=w(null),s=()=>{n.readonly||!n.directToggle||n.fieldType!=="boolean"||(a.value++,clearTimeout(i.value),i.value=setTimeout(()=>{a.value=0},gn),a.value===3&&(a.value=0,clearTimeout(i.value),r("toggle-boolean",{fieldName:n.fieldName,value:!n.value})))},o=()=>{r("edit",n.fieldName,n.value,n.label,n.fieldType)},d=m=>m?/[\p{Emoji}]/u.test(m):!1,p=m=>m==null||m===""?"":new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",minimumFractionDigits:2}).format(m),c=D(()=>{if(n.value===null||n.value===void 0)return"";if(n.fieldType==="select")return String(n.value);if(n.fieldType==="date"&&n.value)try{return new Date(n.value).toLocaleDateString()}catch(m){return n.value}return n.fieldType==="number"||n.fieldType==="int"?String(n.value):n.fieldType==="boolean"?n.value?"Yes":"No":String(n.value)});return(m,$)=>(l(),u("div",null,[h("div",dn,[e.icon?(l(),u("span",cn,[d(e.icon)?(l(),u("span",pn,C(e.icon),1)):e.icon.startsWith("pi-")?(l(),u("i",{key:1,class:A(`pi ${e.icon}`)},null,2)):e.icon.startsWith("feather-")?(l(),x(ke,{key:2,name:e.icon.replace("feather-",""),class:"w-4 h-4"},null,8,["name"])):(l(),u("i",{key:3,class:A(e.icon)},null,2))])):S("",!0),h("span",fn,C(e.label),1)]),e.fieldType==="boolean"?(l(),u("div",{key:0,class:A(["flex items-center justify-between",{"cursor-pointer":!e.readonly&&e.directToggle}]),onClick:he(s,["stop"])},[h("div",hn,[v(P(qe),{id:e.fieldName,modelValue:!!e.value,binary:!0,disabled:"","pt:root:class":"!bg-zinc-100 dark:!bg-zinc-800"},null,8,["id","modelValue"]),h("label",{for:e.fieldName},C(e.value?"Yes":"No"),9,mn)]),e.readonly?S("",!0):(l(),x(P(N),{key:0,icon:"pi pi-pen-to-square",onClick:he(o,["stop"]),severity:e.severity,variant:e.variant,class:"hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},null,8,["severity","variant"]))],2)):e.fieldType==="currency"?(l(),u("div",vn,[v(P(se),{class:"flex items-center w-full"},{default:z(()=>[v(P(oe),{label:e.label,disabled:"",value:p(e.value),"pt:root:class":"!bg-zinc-100 dark:!bg-zinc-800"},null,8,["label","value"]),e.readonly?S("",!0):(l(),x(P(ue),{key:0,"pt:root:class":"!bg-zinc-100 dark:!bg-zinc-800 hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},{default:z(()=>[v(P(N),{icon:"pi pi-pen-to-square",onClick:o,severity:e.severity,variant:e.variant,class:"hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},null,8,["severity","variant"])]),_:1}))]),_:1})])):(l(),x(P(se),{key:2,class:"flex items-center"},{default:z(()=>[v(P(oe),{label:e.label,disabled:"",value:c.value,"pt:root:class":"!bg-zinc-100 dark:!bg-zinc-800"},null,8,["label","value"]),e.readonly?S("",!0):(l(),x(P(ue),{key:0,"pt:root:class":"!bg-zinc-100 dark:!bg-zinc-800 hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},{default:z(()=>[v(P(N),{icon:"pi pi-pen-to-square",onClick:o,severity:e.severity,variant:e.variant,class:"hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},null,8,["severity","variant"])]),_:1}))]),_:1}))]))}},bn={class:"px-2 font-bold"},ni={__name:"EditableFieldset",props:{legend:{type:String,required:!0},fields:{type:Array,default:()=>[]},data:{type:Object,required:!0},columns:{type:Number,default:2},customClass:{type:String,default:""}},emits:["edit","update"],setup(e,{emit:t}){const n=e,r=t,a=D(()=>({"grid-cols-1":!0,"sm:grid-cols-2":n.columns===2,"sm:grid-cols-3":n.columns===3,"sm:grid-cols-4":n.columns===4,"sm:grid-cols-5":n.columns===5,"sm:grid-cols-6":n.columns===6})),i=(s,o,d,p)=>{const c=n.fields.find(m=>m.name===s)||{};r("edit",s,o,d,p,c.options,c.validation,c.doctype)};return(s,o)=>(l(),u("fieldset",{class:A(["border border-zinc-200 dark:border-zinc-700 rounded-xl p-4",e.customClass])},[h("legend",bn,C(e.legend),1),h("div",{class:A(["grid gap-4",a.value])},[(l(!0),u(L,null,V(e.fields,d=>(l(),x(yn,{key:d.name,"field-name":d.name,label:d.label,value:e.data[d.name],"field-type":d.type,readonly:d.readonly,icon:d.icon,"direct-toggle":d.type==="boolean",onEdit:i,onToggleBoolean:o[0]||(o[0]=p=>s.$emit("update",p))},null,8,["field-name","label","value","field-type","readonly","icon","direct-toggle"]))),128))],2)],2))}},$n={class:"child-table"},Sn={class:"flex justify-between items-center mb-4"},kn={class:"text-lg font-medium"},wn={key:0,class:"text-tertiary"},zn={key:1,class:"grid grid-cols-1 gap-3"},Tn={class:"flex flex-wrap gap-2"},xn={key:0,class:"text-sm"},Pn={key:0},Cn={class:"font-medium text-sm"},En={class:"text-sm"},Ln={class:"flex gap-2"},ii={__name:"ChildTable",props:{title:{type:String,default:"Child Items"},rows:{type:Array,default:()=>[]},fields:{type:Array,default:()=>[]},displayFields:{type:Array,default:()=>[]},addButtonLabel:{type:String,default:"Add Item"},emptyMessage:{type:String,default:"No items available."}},emits:["add","update","delete"],setup(e,{emit:t}){const n=e,r=t,{formatCurrency:a,formatDate:i,isEmoji:s}=Te(),o=w(!1),d=w("Add Item"),p=w(!1),c=w(-1),m=w({}),$=w(-1),I=w(!1),j=w(-1),te=D(()=>n.displayFields.length>0?n.displayFields:n.fields),K=D(()=>n.fields.map(y=>Y({},y))),W=()=>{const y={};n.fields.forEach(k=>{k.type==="boolean"?y[k.name]=k.default||!1:y[k.name]=k.default||""}),m.value=y,p.value=!1,c.value=-1,d.value=`Add ${n.title}`,o.value=!0},H=(y,k)=>{m.value=JSON.parse(JSON.stringify(y)),p.value=!0,c.value=k,$.value=k,d.value=`Edit ${n.title}`,o.value=!0},g=y=>{p.value?r("update",{index:c.value,data:y}):r("add",y),o.value=!1,$.value=-1},E=()=>{o.value=!1,$.value=-1},G=y=>{j.value=y,$.value=y,I.value=!0},ne=()=>{r("delete",j.value),I.value=!1,$.value=-1},ie=(y,k)=>{if(y==null)return"";switch(k){case"boolean":return y?"Yes":"No";case"currency":return a(y);case"date":return i(y);default:return String(y)}};return(y,k)=>(l(),u("div",$n,[h("div",Sn,[h("h3",kn,C(e.title),1),v(P(N),{label:e.addButtonLabel,icon:"pi pi-plus",onClick:W},null,8,["label"])]),!e.rows||e.rows.length===0?(l(),u("div",wn,C(e.emptyMessage),1)):(l(),u("div",zn,[(l(!0),u(L,null,V(e.rows,(M,R)=>(l(),u("div",{key:R,class:A(["flex justify-between items-center p-3 border rounded-xl",{"bg-blue-50 dark:bg-blue-900/20":$.value===R}])},[T(y.$slots,"row-content",{row:M,index:R},()=>[h("div",Tn,[(l(!0),u(L,null,V(te.value,f=>(l(),u("div",{key:f.name,class:"flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-zinc-700"},[f.icon?(l(),u("span",xn,[P(s)(f.icon)?(l(),u("span",Pn,C(f.icon),1)):f.icon.startsWith("pi-")?(l(),u("i",{key:1,class:A(`pi ${f.icon}`)},null,2)):f.icon.startsWith("feather-")?(l(),x(ke,{key:2,name:f.icon.replace("feather-",""),class:"w-3 h-3"},null,8,["name"])):(l(),u("i",{key:3,class:A(f.icon)},null,2))])):S("",!0),h("span",Cn,C(f.label)+":",1),h("span",En,C(ie(M[f.name],f.type)),1)]))),128))])]),h("div",Ln,[T(y.$slots,"row-actions",{row:M,index:R,openEditDialog:H,confirmDelete:G},()=>[v(P(N),{icon:"pi pi-pencil",text:"",onClick:f=>H(M,R),class:"hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},null,8,["onClick"]),v(P(N),{icon:"pi pi-trash",text:"",severity:"danger",onClick:f=>G(R),class:"hover:!bg-zinc-200 dark:hover:!bg-zinc-700"},null,8,["onClick"])])])],2))),128))])),v(et,{visible:o.value,"onUpdate:visible":k[0]||(k[0]=M=>o.value=M),title:d.value,fields:K.value,"initial-data":m.value,"submit-button-label":p.value?"Save":"Add",onSubmit:g,onCancel:E},null,8,["visible","title","fields","initial-data","submit-button-label"]),v(un,{visible:I.value,"onUpdate:visible":k[1]||(k[1]=M=>I.value=M),title:`Delete ${e.title}`,message:`Are you sure you want to delete this ${e.title.toLowerCase()}?`,onConfirm:ne,onCancel:k[2]||(k[2]=M=>$.value=-1)},null,8,["visible","title","message"])]))}},Dn={class:"inline-block"},Nn={__name:"CreateNoteButton",props:{doctype:{type:String,default:"User"},docname:{type:String,default:""},type:{type:String,default:"",validator:e=>["","note","task","journal"].includes(e)},label:{type:String,default:""},tooltip:{type:String,default:""},buttonClass:{type:String,default:"p-button-primary"},size:{type:String,default:"normal",validator:e=>["small","normal","large"].includes(e)}},setup(e){const t=e,n=ze("notesDialog",{open:()=>console.warn("Notes dialog API not available"),createWithType:()=>console.warn("Notes dialog createWithType API not available"),setContext:()=>{}}),r=w(null),a=D(()=>t.type===""),i=[{label:"Create Note",icon:"pi pi-file-edit",command:()=>p("note")},{label:"Create Task",icon:"pi pi-check-square",command:()=>p("task")},{label:"Create Journal Entry",icon:"pi pi-book",command:()=>p("journal")}];function s(){return t.label?t.label:t.type==="note"?"New Note":t.type==="task"?"New Task":t.type==="journal"?"New Journal":"Create"}function o(){return t.type==="note"?"pi pi-file-edit":t.type==="task"?"pi pi-check-square":t.type==="journal"?"pi pi-book":"pi pi-plus"}function d(c){t.type?p(t.type):r.value.toggle(c)}function p(c){const m={doctype:t.doctype,docname:t.docname};n.createWithType?n.createWithType(c,m):n.open(m)}return(c,m)=>{const $=N,I=Je;return l(),u("div",Dn,[v($,{label:s(),icon:o(),class:A(e.buttonClass),onClick:d},null,8,["label","icon","class"]),a.value?(l(),x(I,{key:0,ref_key:"typeMenu",ref:r,model:i,popup:!0},null,512)):S("",!0)])}}},ee=we(Nn,[["__scopeId","data-v-3992fb73"]]),An={class:"notes-view"},Mn={key:0,class:"flex justify-center p-4"},In={key:1},Bn={class:"flex justify-between items-center mb-3"},Vn={class:"space-y-3"},jn={key:0,class:"text-center p-4 text-gray-500"},Rn={class:"flex justify-between items-center mb-3"},On={class:"space-y-3"},Fn={key:0,class:"text-center p-4 text-gray-500"},Kn={class:"flex justify-between items-center mb-3"},Gn={class:"space-y-3"},Un={key:0,class:"text-center p-4 text-gray-500"},_n={key:1},qn={class:"flex justify-between items-center mb-3"},Jn={class:"space-y-3"},Wn={key:0,class:"text-center p-4 text-gray-500"},Hn={key:2,class:"text-center mt-4"},Yn={__name:"NotesView",props:{doctype:{type:String,required:!0},docname:{type:String,required:!0},title:{type:String,default:"Notes"},limit:{type:Number,default:5},showTabs:{type:Boolean,default:!0},filter:{type:String,default:""}},setup(e){const t=e,n=ze("notesDialog",{open:()=>console.warn("Notes dialog API not available")}),r=We(),a=w(!0),i=w(!1),s=w(0),o=w(t.limit);He(()=>{t.filter==="task"&&(s.value=1),t.filter==="journal"&&(s.value=2),j()});const d=[{label:"Notes",icon:"pi pi-file",value:0},{label:"Tasks",icon:"pi pi-check-square",value:1},{label:"Journal",icon:"pi pi-book",value:2}];q(()=>[t.doctype,t.docname],()=>{a.value=!0,o.value=t.limit,j()},{deep:!0});const p=D(()=>r.notes.filter(g=>g.rel_doctype===t.doctype&&g.rel_docname===t.docname)),c=D(()=>p.value.filter(g=>!g.task&&!g.journal).slice(0,o.value)),m=D(()=>p.value.filter(g=>g.task).slice(0,o.value)),$=D(()=>p.value.filter(g=>g.journal).slice(0,o.value)),I=D(()=>s.value===0||!t.showTabs?c.value.length<p.value.filter(g=>!g.task&&!g.journal).length:s.value===1?m.value.length<p.value.filter(g=>g.task).length:$.value.length<p.value.filter(g=>g.journal).length);function j(){return B(this,null,function*(){try{yield r.fetchNotesByContext(t.doctype,t.docname),a.value=!1}catch(g){console.error("Failed to load notes:",g),a.value=!1}})}function te(){i.value=!0,o.value+=t.limit,setTimeout(()=>{i.value=!1},300)}function K(g){n.openNote?n.openNote(g):(n.open({doctype:t.doctype,docname:t.docname}),console.warn("notesDialog.openNote method not available - note may not open correctly"))}function W(g){return B(this,null,function*(){try{yield r.toggleSticky(g)}catch(E){console.error("Failed to toggle sticky:",E)}})}function H(g){return B(this,null,function*(){const E=g.status==="Completed"?"To Do":"Completed";try{yield r.updateNote(g.name,{status:E})}catch(G){console.error("Failed to update task status:",G)}})}return(g,E)=>{const G=tt,ne=_("Tab"),ie=_("TabList"),y=Pe,k=_("TabPanels"),M=_("Tabs"),R=N;return l(),u("div",An,[a.value?(l(),u("div",Mn,[v(G,{style:{width:"50px",height:"50px"}})])):(l(),u("div",In,[e.showTabs?(l(),x(M,{key:0,activeIndex:s.value,"onUpdate:activeIndex":E[0]||(E[0]=f=>s.value=f)},{default:z(()=>[v(ie,null,{default:z(()=>[(l(),u(L,null,V(d,f=>v(ne,{key:f.label,value:f.value},{default:z(()=>[h("i",{class:A([f.icon,"mr-2"])},null,2),Ye(C(f.label),1)]),_:2},1032,["value"])),64))]),_:1}),v(k,null,{default:z(()=>[v(y,{value:0},{default:z(()=>[h("div",Bn,[E[1]||(E[1]=h("div",null,"Notes",-1)),v(ee,{doctype:e.doctype,docname:e.docname,type:"note",size:"small",buttonClass:"p-button-sm",label:"Add Note"},null,8,["doctype","docname"])]),h("div",Vn,[c.value.length===0?(l(),u("div",jn," No notes found for this "+C(e.doctype.toLowerCase())+". ",1)):S("",!0),(l(!0),u(L,null,V(c.value,f=>(l(),x(me,{key:f.name,note:f,"view-mode":"list",onClick:U=>K(f),onToggleSticky:U=>W(f.name)},null,8,["note","onClick","onToggleSticky"]))),128))])]),_:1}),v(y,{value:1},{default:z(()=>[h("div",Rn,[E[2]||(E[2]=h("div",null,"Tasks",-1)),v(ee,{doctype:e.doctype,docname:e.docname,size:"small",type:"task",buttonClass:"p-button-sm",label:"Add Task",noteType:"task"},null,8,["doctype","docname"])]),h("div",On,[m.value.length===0?(l(),u("div",Fn," No tasks found for this "+C(e.doctype.toLowerCase())+". ",1)):S("",!0),(l(!0),u(L,null,V(m.value,f=>(l(),x(Xe,{key:f.name,task:f,"view-mode":"list",onClick:U=>K(f),onToggleComplete:U=>H(f)},null,8,["task","onClick","onToggleComplete"]))),128))])]),_:1}),v(y,{value:2},{default:z(()=>[h("div",Kn,[E[3]||(E[3]=h("div",null,"Journal Entries",-1)),v(ee,{doctype:e.doctype,docname:e.docname,size:"small",type:"journal",buttonClass:"p-button-sm",label:"Add Journal Entry",noteType:"journal"},null,8,["doctype","docname"])]),h("div",Gn,[$.value.length===0?(l(),u("div",Un," No journal entries found for this "+C(e.doctype.toLowerCase())+". ",1)):S("",!0),(l(!0),u(L,null,V($.value,f=>(l(),x(Qe,{key:f.name,journal:f,onClick:U=>K(f)},null,8,["journal","onClick"]))),128))])]),_:1})]),_:1})]),_:1},8,["activeIndex"])):S("",!0),e.showTabs?S("",!0):(l(),u("div",_n,[h("div",qn,[E[4]||(E[4]=h("div",null,"Notes",-1)),v(ee,{doctype:e.doctype,docname:e.docname,size:"small",buttonClass:"p-button-sm",label:"Add Note"},null,8,["doctype","docname"])]),h("div",Jn,[c.value.length===0?(l(),u("div",Wn," No notes found for this "+C(e.doctype.toLowerCase())+". ",1)):S("",!0),(l(!0),u(L,null,V(c.value,f=>(l(),x(me,{key:f.name,note:f,"view-mode":"list",onClick:U=>K(f),onToggleSticky:U=>W(f.name)},null,8,["note","onClick","onToggleSticky"]))),128))])]))])),I.value?(l(),u("div",Hn,[v(R,{label:"Load More",icon:"pi pi-chevron-down",text:"",onClick:te,loading:i.value},null,8,["loading"])])):S("",!0)])}}},ri=we(Yn,[["__scopeId","data-v-093727e7"]]);export{ri as N,ni as _,ii as a,ti as b,un as c,Yt as d,Mt as e,Pe as f,ct as g,yt as h,xe as s,ei as u};
