var xc=Object.defineProperty;var $c=(e,n,t)=>n in e?xc(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var Fo=(e,n,t)=>$c(e,typeof n!="symbol"?n+"":n,t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const o of l.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(i){if(i.ep)return;i.ep=!0;const l=t(i);fetch(i.href,l)}})();function Ec(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var cs={exports:{}},ti={},fs={exports:{}},D={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Gt=Symbol.for("react.element"),Pc=Symbol.for("react.portal"),jc=Symbol.for("react.fragment"),Cc=Symbol.for("react.strict_mode"),Tc=Symbol.for("react.profiler"),Dc=Symbol.for("react.provider"),Ac=Symbol.for("react.context"),Lc=Symbol.for("react.forward_ref"),zc=Symbol.for("react.suspense"),Nc=Symbol.for("react.memo"),Fc=Symbol.for("react.lazy"),Mo=Symbol.iterator;function Mc(e){return e===null||typeof e!="object"?null:(e=Mo&&e[Mo]||e["@@iterator"],typeof e=="function"?e:null)}var ds={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ps=Object.assign,ms={};function ut(e,n,t){this.props=e,this.context=n,this.refs=ms,this.updater=t||ds}ut.prototype.isReactComponent={};ut.prototype.setState=function(e,n){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,n,"setState")};ut.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function hs(){}hs.prototype=ut.prototype;function Il(e,n,t){this.props=e,this.context=n,this.refs=ms,this.updater=t||ds}var Vl=Il.prototype=new hs;Vl.constructor=Il;ps(Vl,ut.prototype);Vl.isPureReactComponent=!0;var Ro=Array.isArray,gs=Object.prototype.hasOwnProperty,Hl={current:null},ys={key:!0,ref:!0,__self:!0,__source:!0};function vs(e,n,t){var r,i={},l=null,o=null;if(n!=null)for(r in n.ref!==void 0&&(o=n.ref),n.key!==void 0&&(l=""+n.key),n)gs.call(n,r)&&!ys.hasOwnProperty(r)&&(i[r]=n[r]);var u=arguments.length-2;if(u===1)i.children=t;else if(1<u){for(var s=Array(u),c=0;c<u;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in u=e.defaultProps,u)i[r]===void 0&&(i[r]=u[r]);return{$$typeof:Gt,type:e,key:l,ref:o,props:i,_owner:Hl.current}}function Rc(e,n){return{$$typeof:Gt,type:e.type,key:n,ref:e.ref,props:e.props,_owner:e._owner}}function Wl(e){return typeof e=="object"&&e!==null&&e.$$typeof===Gt}function Bc(e){var n={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(t){return n[t]})}var Bo=/\/+/g;function Si(e,n){return typeof e=="object"&&e!==null&&e.key!=null?Bc(""+e.key):n.toString(36)}function kr(e,n,t,r,i){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var o=!1;if(e===null)o=!0;else switch(l){case"string":case"number":o=!0;break;case"object":switch(e.$$typeof){case Gt:case Pc:o=!0}}if(o)return o=e,i=i(o),e=r===""?"."+Si(o,0):r,Ro(i)?(t="",e!=null&&(t=e.replace(Bo,"$&/")+"/"),kr(i,n,t,"",function(c){return c})):i!=null&&(Wl(i)&&(i=Rc(i,t+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(Bo,"$&/")+"/")+e)),n.push(i)),1;if(o=0,r=r===""?".":r+":",Ro(e))for(var u=0;u<e.length;u++){l=e[u];var s=r+Si(l,u);o+=kr(l,n,t,s,i)}else if(s=Mc(e),typeof s=="function")for(e=s.call(e),u=0;!(l=e.next()).done;)l=l.value,s=r+Si(l,u++),o+=kr(l,n,t,s,i);else if(l==="object")throw n=String(e),Error("Objects are not valid as a React child (found: "+(n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n)+"). If you meant to render a collection of children, use an array instead.");return o}function rr(e,n,t){if(e==null)return e;var r=[],i=0;return kr(e,r,"","",function(l){return n.call(t,l,i++)}),r}function Ic(e){if(e._status===-1){var n=e._result;n=n(),n.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var ae={current:null},Sr={transition:null},Vc={ReactCurrentDispatcher:ae,ReactCurrentBatchConfig:Sr,ReactCurrentOwner:Hl};function ws(){throw Error("act(...) is not supported in production builds of React.")}D.Children={map:rr,forEach:function(e,n,t){rr(e,function(){n.apply(this,arguments)},t)},count:function(e){var n=0;return rr(e,function(){n++}),n},toArray:function(e){return rr(e,function(n){return n})||[]},only:function(e){if(!Wl(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};D.Component=ut;D.Fragment=jc;D.Profiler=Tc;D.PureComponent=Il;D.StrictMode=Cc;D.Suspense=zc;D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Vc;D.act=ws;D.cloneElement=function(e,n,t){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=ps({},e.props),i=e.key,l=e.ref,o=e._owner;if(n!=null){if(n.ref!==void 0&&(l=n.ref,o=Hl.current),n.key!==void 0&&(i=""+n.key),e.type&&e.type.defaultProps)var u=e.type.defaultProps;for(s in n)gs.call(n,s)&&!ys.hasOwnProperty(s)&&(r[s]=n[s]===void 0&&u!==void 0?u[s]:n[s])}var s=arguments.length-2;if(s===1)r.children=t;else if(1<s){u=Array(s);for(var c=0;c<s;c++)u[c]=arguments[c+2];r.children=u}return{$$typeof:Gt,type:e.type,key:i,ref:l,props:r,_owner:o}};D.createContext=function(e){return e={$$typeof:Ac,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Dc,_context:e},e.Consumer=e};D.createElement=vs;D.createFactory=function(e){var n=vs.bind(null,e);return n.type=e,n};D.createRef=function(){return{current:null}};D.forwardRef=function(e){return{$$typeof:Lc,render:e}};D.isValidElement=Wl;D.lazy=function(e){return{$$typeof:Fc,_payload:{_status:-1,_result:e},_init:Ic}};D.memo=function(e,n){return{$$typeof:Nc,type:e,compare:n===void 0?null:n}};D.startTransition=function(e){var n=Sr.transition;Sr.transition={};try{e()}finally{Sr.transition=n}};D.unstable_act=ws;D.useCallback=function(e,n){return ae.current.useCallback(e,n)};D.useContext=function(e){return ae.current.useContext(e)};D.useDebugValue=function(){};D.useDeferredValue=function(e){return ae.current.useDeferredValue(e)};D.useEffect=function(e,n){return ae.current.useEffect(e,n)};D.useId=function(){return ae.current.useId()};D.useImperativeHandle=function(e,n,t){return ae.current.useImperativeHandle(e,n,t)};D.useInsertionEffect=function(e,n){return ae.current.useInsertionEffect(e,n)};D.useLayoutEffect=function(e,n){return ae.current.useLayoutEffect(e,n)};D.useMemo=function(e,n){return ae.current.useMemo(e,n)};D.useReducer=function(e,n,t){return ae.current.useReducer(e,n,t)};D.useRef=function(e){return ae.current.useRef(e)};D.useState=function(e){return ae.current.useState(e)};D.useSyncExternalStore=function(e,n,t){return ae.current.useSyncExternalStore(e,n,t)};D.useTransition=function(){return ae.current.useTransition()};D.version="18.3.1";fs.exports=D;var Le=fs.exports;const Hc=Ec(Le);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Wc=Le,Uc=Symbol.for("react.element"),qc=Symbol.for("react.fragment"),Kc=Object.prototype.hasOwnProperty,Qc=Wc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Yc={key:!0,ref:!0,__self:!0,__source:!0};function ks(e,n,t){var r,i={},l=null,o=null;t!==void 0&&(l=""+t),n.key!==void 0&&(l=""+n.key),n.ref!==void 0&&(o=n.ref);for(r in n)Kc.call(n,r)&&!Yc.hasOwnProperty(r)&&(i[r]=n[r]);if(e&&e.defaultProps)for(r in n=e.defaultProps,n)i[r]===void 0&&(i[r]=n[r]);return{$$typeof:Uc,type:e,key:l,ref:o,props:i,_owner:Qc.current}}ti.Fragment=qc;ti.jsx=ks;ti.jsxs=ks;cs.exports=ti;var j=cs.exports,Qi={},Ss={exports:{}},ke={},_s={exports:{}},Os={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function n(O,C){var T=O.length;O.push(C);e:for(;0<T;){var q=T-1>>>1,G=O[q];if(0<i(G,C))O[q]=C,O[T]=G,T=q;else break e}}function t(O){return O.length===0?null:O[0]}function r(O){if(O.length===0)return null;var C=O[0],T=O.pop();if(T!==C){O[0]=T;e:for(var q=0,G=O.length,nr=G>>>1;q<nr;){var wn=2*(q+1)-1,ki=O[wn],kn=wn+1,tr=O[kn];if(0>i(ki,T))kn<G&&0>i(tr,ki)?(O[q]=tr,O[kn]=T,q=kn):(O[q]=ki,O[wn]=T,q=wn);else if(kn<G&&0>i(tr,T))O[q]=tr,O[kn]=T,q=kn;else break e}}return C}function i(O,C){var T=O.sortIndex-C.sortIndex;return T!==0?T:O.id-C.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;e.unstable_now=function(){return l.now()}}else{var o=Date,u=o.now();e.unstable_now=function(){return o.now()-u}}var s=[],c=[],h=1,p=null,m=3,v=!1,w=!1,k=!1,R=typeof setTimeout=="function"?setTimeout:null,f=typeof clearTimeout=="function"?clearTimeout:null,a=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function d(O){for(var C=t(c);C!==null;){if(C.callback===null)r(c);else if(C.startTime<=O)r(c),C.sortIndex=C.expirationTime,n(s,C);else break;C=t(c)}}function g(O){if(k=!1,d(O),!w)if(t(s)!==null)w=!0,vi(_);else{var C=t(c);C!==null&&wi(g,C.startTime-O)}}function _(O,C){w=!1,k&&(k=!1,f(P),P=-1),v=!0;var T=m;try{for(d(C),p=t(s);p!==null&&(!(p.expirationTime>C)||O&&!je());){var q=p.callback;if(typeof q=="function"){p.callback=null,m=p.priorityLevel;var G=q(p.expirationTime<=C);C=e.unstable_now(),typeof G=="function"?p.callback=G:p===t(s)&&r(s),d(C)}else r(s);p=t(s)}if(p!==null)var nr=!0;else{var wn=t(c);wn!==null&&wi(g,wn.startTime-C),nr=!1}return nr}finally{p=null,m=T,v=!1}}var $=!1,E=null,P=-1,U=5,A=-1;function je(){return!(e.unstable_now()-A<U)}function ct(){if(E!==null){var O=e.unstable_now();A=O;var C=!0;try{C=E(!0,O)}finally{C?ft():($=!1,E=null)}}else $=!1}var ft;if(typeof a=="function")ft=function(){a(ct)};else if(typeof MessageChannel<"u"){var No=new MessageChannel,Oc=No.port2;No.port1.onmessage=ct,ft=function(){Oc.postMessage(null)}}else ft=function(){R(ct,0)};function vi(O){E=O,$||($=!0,ft())}function wi(O,C){P=R(function(){O(e.unstable_now())},C)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(O){O.callback=null},e.unstable_continueExecution=function(){w||v||(w=!0,vi(_))},e.unstable_forceFrameRate=function(O){0>O||125<O?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):U=0<O?Math.floor(1e3/O):5},e.unstable_getCurrentPriorityLevel=function(){return m},e.unstable_getFirstCallbackNode=function(){return t(s)},e.unstable_next=function(O){switch(m){case 1:case 2:case 3:var C=3;break;default:C=m}var T=m;m=C;try{return O()}finally{m=T}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(O,C){switch(O){case 1:case 2:case 3:case 4:case 5:break;default:O=3}var T=m;m=O;try{return C()}finally{m=T}},e.unstable_scheduleCallback=function(O,C,T){var q=e.unstable_now();switch(typeof T=="object"&&T!==null?(T=T.delay,T=typeof T=="number"&&0<T?q+T:q):T=q,O){case 1:var G=-1;break;case 2:G=250;break;case 5:G=1073741823;break;case 4:G=1e4;break;default:G=5e3}return G=T+G,O={id:h++,callback:C,priorityLevel:O,startTime:T,expirationTime:G,sortIndex:-1},T>q?(O.sortIndex=T,n(c,O),t(s)===null&&O===t(c)&&(k?(f(P),P=-1):k=!0,wi(g,T-q))):(O.sortIndex=G,n(s,O),w||v||(w=!0,vi(_))),O},e.unstable_shouldYield=je,e.unstable_wrapCallback=function(O){var C=m;return function(){var T=m;m=C;try{return O.apply(this,arguments)}finally{m=T}}}})(Os);_s.exports=Os;var Xc=_s.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Gc=Le,we=Xc;function y(e){for(var n="https://reactjs.org/docs/error-decoder.html?invariant="+e,t=1;t<arguments.length;t++)n+="&args[]="+encodeURIComponent(arguments[t]);return"Minified React error #"+e+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var xs=new Set,Lt={};function Ln(e,n){et(e,n),et(e+"Capture",n)}function et(e,n){for(Lt[e]=n,e=0;e<n.length;e++)xs.add(n[e])}var Qe=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Yi=Object.prototype.hasOwnProperty,Jc=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Io={},Vo={};function bc(e){return Yi.call(Vo,e)?!0:Yi.call(Io,e)?!1:Jc.test(e)?Vo[e]=!0:(Io[e]=!0,!1)}function Zc(e,n,t,r){if(t!==null&&t.type===0)return!1;switch(typeof n){case"function":case"symbol":return!0;case"boolean":return r?!1:t!==null?!t.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function ef(e,n,t,r){if(n===null||typeof n>"u"||Zc(e,n,t,r))return!0;if(r)return!1;if(t!==null)switch(t.type){case 3:return!n;case 4:return n===!1;case 5:return isNaN(n);case 6:return isNaN(n)||1>n}return!1}function ce(e,n,t,r,i,l,o){this.acceptsBooleans=n===2||n===3||n===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=t,this.propertyName=e,this.type=n,this.sanitizeURL=l,this.removeEmptyString=o}var ne={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){ne[e]=new ce(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var n=e[0];ne[n]=new ce(n,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){ne[e]=new ce(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){ne[e]=new ce(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){ne[e]=new ce(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){ne[e]=new ce(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){ne[e]=new ce(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){ne[e]=new ce(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){ne[e]=new ce(e,5,!1,e.toLowerCase(),null,!1,!1)});var Ul=/[\-:]([a-z])/g;function ql(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var n=e.replace(Ul,ql);ne[n]=new ce(n,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var n=e.replace(Ul,ql);ne[n]=new ce(n,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var n=e.replace(Ul,ql);ne[n]=new ce(n,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){ne[e]=new ce(e,1,!1,e.toLowerCase(),null,!1,!1)});ne.xlinkHref=new ce("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){ne[e]=new ce(e,1,!1,e.toLowerCase(),null,!0,!0)});function Kl(e,n,t,r){var i=ne.hasOwnProperty(n)?ne[n]:null;(i!==null?i.type!==0:r||!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(ef(n,t,i,r)&&(t=null),r||i===null?bc(n)&&(t===null?e.removeAttribute(n):e.setAttribute(n,""+t)):i.mustUseProperty?e[i.propertyName]=t===null?i.type===3?!1:"":t:(n=i.attributeName,r=i.attributeNamespace,t===null?e.removeAttribute(n):(i=i.type,t=i===3||i===4&&t===!0?"":""+t,r?e.setAttributeNS(r,n,t):e.setAttribute(n,t))))}var Je=Gc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ir=Symbol.for("react.element"),Fn=Symbol.for("react.portal"),Mn=Symbol.for("react.fragment"),Ql=Symbol.for("react.strict_mode"),Xi=Symbol.for("react.profiler"),$s=Symbol.for("react.provider"),Es=Symbol.for("react.context"),Yl=Symbol.for("react.forward_ref"),Gi=Symbol.for("react.suspense"),Ji=Symbol.for("react.suspense_list"),Xl=Symbol.for("react.memo"),Ze=Symbol.for("react.lazy"),Ps=Symbol.for("react.offscreen"),Ho=Symbol.iterator;function dt(e){return e===null||typeof e!="object"?null:(e=Ho&&e[Ho]||e["@@iterator"],typeof e=="function"?e:null)}var H=Object.assign,_i;function kt(e){if(_i===void 0)try{throw Error()}catch(t){var n=t.stack.trim().match(/\n( *(at )?)/);_i=n&&n[1]||""}return`
`+_i+e}var Oi=!1;function xi(e,n){if(!e||Oi)return"";Oi=!0;var t=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(n)if(n=function(){throw Error()},Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(n,[])}catch(c){var r=c}Reflect.construct(e,[],n)}else{try{n.call()}catch(c){r=c}e.call(n.prototype)}else{try{throw Error()}catch(c){r=c}e()}}catch(c){if(c&&r&&typeof c.stack=="string"){for(var i=c.stack.split(`
`),l=r.stack.split(`
`),o=i.length-1,u=l.length-1;1<=o&&0<=u&&i[o]!==l[u];)u--;for(;1<=o&&0<=u;o--,u--)if(i[o]!==l[u]){if(o!==1||u!==1)do if(o--,u--,0>u||i[o]!==l[u]){var s=`
`+i[o].replace(" at new "," at ");return e.displayName&&s.includes("<anonymous>")&&(s=s.replace("<anonymous>",e.displayName)),s}while(1<=o&&0<=u);break}}}finally{Oi=!1,Error.prepareStackTrace=t}return(e=e?e.displayName||e.name:"")?kt(e):""}function nf(e){switch(e.tag){case 5:return kt(e.type);case 16:return kt("Lazy");case 13:return kt("Suspense");case 19:return kt("SuspenseList");case 0:case 2:case 15:return e=xi(e.type,!1),e;case 11:return e=xi(e.type.render,!1),e;case 1:return e=xi(e.type,!0),e;default:return""}}function bi(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Mn:return"Fragment";case Fn:return"Portal";case Xi:return"Profiler";case Ql:return"StrictMode";case Gi:return"Suspense";case Ji:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Es:return(e.displayName||"Context")+".Consumer";case $s:return(e._context.displayName||"Context")+".Provider";case Yl:var n=e.render;return e=e.displayName,e||(e=n.displayName||n.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Xl:return n=e.displayName||null,n!==null?n:bi(e.type)||"Memo";case Ze:n=e._payload,e=e._init;try{return bi(e(n))}catch{}}return null}function tf(e){var n=e.type;switch(e.tag){case 24:return"Cache";case 9:return(n.displayName||"Context")+".Consumer";case 10:return(n._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=n.render,e=e.displayName||e.name||"",n.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return n;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return bi(n);case 8:return n===Ql?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n}return null}function mn(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function js(e){var n=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function rf(e){var n=js(e)?"checked":"value",t=Object.getOwnPropertyDescriptor(e.constructor.prototype,n),r=""+e[n];if(!e.hasOwnProperty(n)&&typeof t<"u"&&typeof t.get=="function"&&typeof t.set=="function"){var i=t.get,l=t.set;return Object.defineProperty(e,n,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,l.call(this,o)}}),Object.defineProperty(e,n,{enumerable:t.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){e._valueTracker=null,delete e[n]}}}}function lr(e){e._valueTracker||(e._valueTracker=rf(e))}function Cs(e){if(!e)return!1;var n=e._valueTracker;if(!n)return!0;var t=n.getValue(),r="";return e&&(r=js(e)?e.checked?"true":"false":e.value),e=r,e!==t?(n.setValue(e),!0):!1}function Ar(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Zi(e,n){var t=n.checked;return H({},n,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:t??e._wrapperState.initialChecked})}function Wo(e,n){var t=n.defaultValue==null?"":n.defaultValue,r=n.checked!=null?n.checked:n.defaultChecked;t=mn(n.value!=null?n.value:t),e._wrapperState={initialChecked:r,initialValue:t,controlled:n.type==="checkbox"||n.type==="radio"?n.checked!=null:n.value!=null}}function Ts(e,n){n=n.checked,n!=null&&Kl(e,"checked",n,!1)}function el(e,n){Ts(e,n);var t=mn(n.value),r=n.type;if(t!=null)r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+t):e.value!==""+t&&(e.value=""+t);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}n.hasOwnProperty("value")?nl(e,n.type,t):n.hasOwnProperty("defaultValue")&&nl(e,n.type,mn(n.defaultValue)),n.checked==null&&n.defaultChecked!=null&&(e.defaultChecked=!!n.defaultChecked)}function Uo(e,n,t){if(n.hasOwnProperty("value")||n.hasOwnProperty("defaultValue")){var r=n.type;if(!(r!=="submit"&&r!=="reset"||n.value!==void 0&&n.value!==null))return;n=""+e._wrapperState.initialValue,t||n===e.value||(e.value=n),e.defaultValue=n}t=e.name,t!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,t!==""&&(e.name=t)}function nl(e,n,t){(n!=="number"||Ar(e.ownerDocument)!==e)&&(t==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+t&&(e.defaultValue=""+t))}var St=Array.isArray;function Yn(e,n,t,r){if(e=e.options,n){n={};for(var i=0;i<t.length;i++)n["$"+t[i]]=!0;for(t=0;t<e.length;t++)i=n.hasOwnProperty("$"+e[t].value),e[t].selected!==i&&(e[t].selected=i),i&&r&&(e[t].defaultSelected=!0)}else{for(t=""+mn(t),n=null,i=0;i<e.length;i++){if(e[i].value===t){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}n!==null||e[i].disabled||(n=e[i])}n!==null&&(n.selected=!0)}}function tl(e,n){if(n.dangerouslySetInnerHTML!=null)throw Error(y(91));return H({},n,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function qo(e,n){var t=n.value;if(t==null){if(t=n.children,n=n.defaultValue,t!=null){if(n!=null)throw Error(y(92));if(St(t)){if(1<t.length)throw Error(y(93));t=t[0]}n=t}n==null&&(n=""),t=n}e._wrapperState={initialValue:mn(t)}}function Ds(e,n){var t=mn(n.value),r=mn(n.defaultValue);t!=null&&(t=""+t,t!==e.value&&(e.value=t),n.defaultValue==null&&e.defaultValue!==t&&(e.defaultValue=t)),r!=null&&(e.defaultValue=""+r)}function Ko(e){var n=e.textContent;n===e._wrapperState.initialValue&&n!==""&&n!==null&&(e.value=n)}function As(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function rl(e,n){return e==null||e==="http://www.w3.org/1999/xhtml"?As(n):e==="http://www.w3.org/2000/svg"&&n==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var or,Ls=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(n,t,r,i){MSApp.execUnsafeLocalFunction(function(){return e(n,t,r,i)})}:e}(function(e,n){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=n;else{for(or=or||document.createElement("div"),or.innerHTML="<svg>"+n.valueOf().toString()+"</svg>",n=or.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;n.firstChild;)e.appendChild(n.firstChild)}});function zt(e,n){if(n){var t=e.firstChild;if(t&&t===e.lastChild&&t.nodeType===3){t.nodeValue=n;return}}e.textContent=n}var xt={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},lf=["Webkit","ms","Moz","O"];Object.keys(xt).forEach(function(e){lf.forEach(function(n){n=n+e.charAt(0).toUpperCase()+e.substring(1),xt[n]=xt[e]})});function zs(e,n,t){return n==null||typeof n=="boolean"||n===""?"":t||typeof n!="number"||n===0||xt.hasOwnProperty(e)&&xt[e]?(""+n).trim():n+"px"}function Ns(e,n){e=e.style;for(var t in n)if(n.hasOwnProperty(t)){var r=t.indexOf("--")===0,i=zs(t,n[t],r);t==="float"&&(t="cssFloat"),r?e.setProperty(t,i):e[t]=i}}var of=H({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function il(e,n){if(n){if(of[e]&&(n.children!=null||n.dangerouslySetInnerHTML!=null))throw Error(y(137,e));if(n.dangerouslySetInnerHTML!=null){if(n.children!=null)throw Error(y(60));if(typeof n.dangerouslySetInnerHTML!="object"||!("__html"in n.dangerouslySetInnerHTML))throw Error(y(61))}if(n.style!=null&&typeof n.style!="object")throw Error(y(62))}}function ll(e,n){if(e.indexOf("-")===-1)return typeof n.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ol=null;function Gl(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var ul=null,Xn=null,Gn=null;function Qo(e){if(e=Zt(e)){if(typeof ul!="function")throw Error(y(280));var n=e.stateNode;n&&(n=ui(n),ul(e.stateNode,e.type,n))}}function Fs(e){Xn?Gn?Gn.push(e):Gn=[e]:Xn=e}function Ms(){if(Xn){var e=Xn,n=Gn;if(Gn=Xn=null,Qo(e),n)for(e=0;e<n.length;e++)Qo(n[e])}}function Rs(e,n){return e(n)}function Bs(){}var $i=!1;function Is(e,n,t){if($i)return e(n,t);$i=!0;try{return Rs(e,n,t)}finally{$i=!1,(Xn!==null||Gn!==null)&&(Bs(),Ms())}}function Nt(e,n){var t=e.stateNode;if(t===null)return null;var r=ui(t);if(r===null)return null;t=r[n];e:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(t&&typeof t!="function")throw Error(y(231,n,typeof t));return t}var sl=!1;if(Qe)try{var pt={};Object.defineProperty(pt,"passive",{get:function(){sl=!0}}),window.addEventListener("test",pt,pt),window.removeEventListener("test",pt,pt)}catch{sl=!1}function uf(e,n,t,r,i,l,o,u,s){var c=Array.prototype.slice.call(arguments,3);try{n.apply(t,c)}catch(h){this.onError(h)}}var $t=!1,Lr=null,zr=!1,al=null,sf={onError:function(e){$t=!0,Lr=e}};function af(e,n,t,r,i,l,o,u,s){$t=!1,Lr=null,uf.apply(sf,arguments)}function cf(e,n,t,r,i,l,o,u,s){if(af.apply(this,arguments),$t){if($t){var c=Lr;$t=!1,Lr=null}else throw Error(y(198));zr||(zr=!0,al=c)}}function zn(e){var n=e,t=e;if(e.alternate)for(;n.return;)n=n.return;else{e=n;do n=e,n.flags&4098&&(t=n.return),e=n.return;while(e)}return n.tag===3?t:null}function Vs(e){if(e.tag===13){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function Yo(e){if(zn(e)!==e)throw Error(y(188))}function ff(e){var n=e.alternate;if(!n){if(n=zn(e),n===null)throw Error(y(188));return n!==e?null:e}for(var t=e,r=n;;){var i=t.return;if(i===null)break;var l=i.alternate;if(l===null){if(r=i.return,r!==null){t=r;continue}break}if(i.child===l.child){for(l=i.child;l;){if(l===t)return Yo(i),e;if(l===r)return Yo(i),n;l=l.sibling}throw Error(y(188))}if(t.return!==r.return)t=i,r=l;else{for(var o=!1,u=i.child;u;){if(u===t){o=!0,t=i,r=l;break}if(u===r){o=!0,r=i,t=l;break}u=u.sibling}if(!o){for(u=l.child;u;){if(u===t){o=!0,t=l,r=i;break}if(u===r){o=!0,r=l,t=i;break}u=u.sibling}if(!o)throw Error(y(189))}}if(t.alternate!==r)throw Error(y(190))}if(t.tag!==3)throw Error(y(188));return t.stateNode.current===t?e:n}function Hs(e){return e=ff(e),e!==null?Ws(e):null}function Ws(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var n=Ws(e);if(n!==null)return n;e=e.sibling}return null}var Us=we.unstable_scheduleCallback,Xo=we.unstable_cancelCallback,df=we.unstable_shouldYield,pf=we.unstable_requestPaint,K=we.unstable_now,mf=we.unstable_getCurrentPriorityLevel,Jl=we.unstable_ImmediatePriority,qs=we.unstable_UserBlockingPriority,Nr=we.unstable_NormalPriority,hf=we.unstable_LowPriority,Ks=we.unstable_IdlePriority,ri=null,Ie=null;function gf(e){if(Ie&&typeof Ie.onCommitFiberRoot=="function")try{Ie.onCommitFiberRoot(ri,e,void 0,(e.current.flags&128)===128)}catch{}}var ze=Math.clz32?Math.clz32:wf,yf=Math.log,vf=Math.LN2;function wf(e){return e>>>=0,e===0?32:31-(yf(e)/vf|0)|0}var ur=64,sr=4194304;function _t(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Fr(e,n){var t=e.pendingLanes;if(t===0)return 0;var r=0,i=e.suspendedLanes,l=e.pingedLanes,o=t&268435455;if(o!==0){var u=o&~i;u!==0?r=_t(u):(l&=o,l!==0&&(r=_t(l)))}else o=t&~i,o!==0?r=_t(o):l!==0&&(r=_t(l));if(r===0)return 0;if(n!==0&&n!==r&&!(n&i)&&(i=r&-r,l=n&-n,i>=l||i===16&&(l&4194240)!==0))return n;if(r&4&&(r|=t&16),n=e.entangledLanes,n!==0)for(e=e.entanglements,n&=r;0<n;)t=31-ze(n),i=1<<t,r|=e[t],n&=~i;return r}function kf(e,n){switch(e){case 1:case 2:case 4:return n+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Sf(e,n){for(var t=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,l=e.pendingLanes;0<l;){var o=31-ze(l),u=1<<o,s=i[o];s===-1?(!(u&t)||u&r)&&(i[o]=kf(u,n)):s<=n&&(e.expiredLanes|=u),l&=~u}}function cl(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Qs(){var e=ur;return ur<<=1,!(ur&4194240)&&(ur=64),e}function Ei(e){for(var n=[],t=0;31>t;t++)n.push(e);return n}function Jt(e,n,t){e.pendingLanes|=n,n!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,n=31-ze(n),e[n]=t}function _f(e,n){var t=e.pendingLanes&~n;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=n,e.mutableReadLanes&=n,e.entangledLanes&=n,n=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<t;){var i=31-ze(t),l=1<<i;n[i]=0,r[i]=-1,e[i]=-1,t&=~l}}function bl(e,n){var t=e.entangledLanes|=n;for(e=e.entanglements;t;){var r=31-ze(t),i=1<<r;i&n|e[r]&n&&(e[r]|=n),t&=~i}}var z=0;function Ys(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Xs,Zl,Gs,Js,bs,fl=!1,ar=[],on=null,un=null,sn=null,Ft=new Map,Mt=new Map,nn=[],Of="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Go(e,n){switch(e){case"focusin":case"focusout":on=null;break;case"dragenter":case"dragleave":un=null;break;case"mouseover":case"mouseout":sn=null;break;case"pointerover":case"pointerout":Ft.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":Mt.delete(n.pointerId)}}function mt(e,n,t,r,i,l){return e===null||e.nativeEvent!==l?(e={blockedOn:n,domEventName:t,eventSystemFlags:r,nativeEvent:l,targetContainers:[i]},n!==null&&(n=Zt(n),n!==null&&Zl(n)),e):(e.eventSystemFlags|=r,n=e.targetContainers,i!==null&&n.indexOf(i)===-1&&n.push(i),e)}function xf(e,n,t,r,i){switch(n){case"focusin":return on=mt(on,e,n,t,r,i),!0;case"dragenter":return un=mt(un,e,n,t,r,i),!0;case"mouseover":return sn=mt(sn,e,n,t,r,i),!0;case"pointerover":var l=i.pointerId;return Ft.set(l,mt(Ft.get(l)||null,e,n,t,r,i)),!0;case"gotpointercapture":return l=i.pointerId,Mt.set(l,mt(Mt.get(l)||null,e,n,t,r,i)),!0}return!1}function Zs(e){var n=On(e.target);if(n!==null){var t=zn(n);if(t!==null){if(n=t.tag,n===13){if(n=Vs(t),n!==null){e.blockedOn=n,bs(e.priority,function(){Gs(t)});return}}else if(n===3&&t.stateNode.current.memoizedState.isDehydrated){e.blockedOn=t.tag===3?t.stateNode.containerInfo:null;return}}}e.blockedOn=null}function _r(e){if(e.blockedOn!==null)return!1;for(var n=e.targetContainers;0<n.length;){var t=dl(e.domEventName,e.eventSystemFlags,n[0],e.nativeEvent);if(t===null){t=e.nativeEvent;var r=new t.constructor(t.type,t);ol=r,t.target.dispatchEvent(r),ol=null}else return n=Zt(t),n!==null&&Zl(n),e.blockedOn=t,!1;n.shift()}return!0}function Jo(e,n,t){_r(e)&&t.delete(n)}function $f(){fl=!1,on!==null&&_r(on)&&(on=null),un!==null&&_r(un)&&(un=null),sn!==null&&_r(sn)&&(sn=null),Ft.forEach(Jo),Mt.forEach(Jo)}function ht(e,n){e.blockedOn===n&&(e.blockedOn=null,fl||(fl=!0,we.unstable_scheduleCallback(we.unstable_NormalPriority,$f)))}function Rt(e){function n(i){return ht(i,e)}if(0<ar.length){ht(ar[0],e);for(var t=1;t<ar.length;t++){var r=ar[t];r.blockedOn===e&&(r.blockedOn=null)}}for(on!==null&&ht(on,e),un!==null&&ht(un,e),sn!==null&&ht(sn,e),Ft.forEach(n),Mt.forEach(n),t=0;t<nn.length;t++)r=nn[t],r.blockedOn===e&&(r.blockedOn=null);for(;0<nn.length&&(t=nn[0],t.blockedOn===null);)Zs(t),t.blockedOn===null&&nn.shift()}var Jn=Je.ReactCurrentBatchConfig,Mr=!0;function Ef(e,n,t,r){var i=z,l=Jn.transition;Jn.transition=null;try{z=1,eo(e,n,t,r)}finally{z=i,Jn.transition=l}}function Pf(e,n,t,r){var i=z,l=Jn.transition;Jn.transition=null;try{z=4,eo(e,n,t,r)}finally{z=i,Jn.transition=l}}function eo(e,n,t,r){if(Mr){var i=dl(e,n,t,r);if(i===null)Fi(e,n,r,Rr,t),Go(e,r);else if(xf(i,e,n,t,r))r.stopPropagation();else if(Go(e,r),n&4&&-1<Of.indexOf(e)){for(;i!==null;){var l=Zt(i);if(l!==null&&Xs(l),l=dl(e,n,t,r),l===null&&Fi(e,n,r,Rr,t),l===i)break;i=l}i!==null&&r.stopPropagation()}else Fi(e,n,r,null,t)}}var Rr=null;function dl(e,n,t,r){if(Rr=null,e=Gl(r),e=On(e),e!==null)if(n=zn(e),n===null)e=null;else if(t=n.tag,t===13){if(e=Vs(n),e!==null)return e;e=null}else if(t===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;e=null}else n!==e&&(e=null);return Rr=e,null}function ea(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(mf()){case Jl:return 1;case qs:return 4;case Nr:case hf:return 16;case Ks:return 536870912;default:return 16}default:return 16}}var rn=null,no=null,Or=null;function na(){if(Or)return Or;var e,n=no,t=n.length,r,i="value"in rn?rn.value:rn.textContent,l=i.length;for(e=0;e<t&&n[e]===i[e];e++);var o=t-e;for(r=1;r<=o&&n[t-r]===i[l-r];r++);return Or=i.slice(e,1<r?1-r:void 0)}function xr(e){var n=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&n===13&&(e=13)):e=n,e===10&&(e=13),32<=e||e===13?e:0}function cr(){return!0}function bo(){return!1}function Se(e){function n(t,r,i,l,o){this._reactName=t,this._targetInst=i,this.type=r,this.nativeEvent=l,this.target=o,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(t=e[u],this[u]=t?t(l):l[u]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?cr:bo,this.isPropagationStopped=bo,this}return H(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var t=this.nativeEvent;t&&(t.preventDefault?t.preventDefault():typeof t.returnValue!="unknown"&&(t.returnValue=!1),this.isDefaultPrevented=cr)},stopPropagation:function(){var t=this.nativeEvent;t&&(t.stopPropagation?t.stopPropagation():typeof t.cancelBubble!="unknown"&&(t.cancelBubble=!0),this.isPropagationStopped=cr)},persist:function(){},isPersistent:cr}),n}var st={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},to=Se(st),bt=H({},st,{view:0,detail:0}),jf=Se(bt),Pi,ji,gt,ii=H({},bt,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ro,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==gt&&(gt&&e.type==="mousemove"?(Pi=e.screenX-gt.screenX,ji=e.screenY-gt.screenY):ji=Pi=0,gt=e),Pi)},movementY:function(e){return"movementY"in e?e.movementY:ji}}),Zo=Se(ii),Cf=H({},ii,{dataTransfer:0}),Tf=Se(Cf),Df=H({},bt,{relatedTarget:0}),Ci=Se(Df),Af=H({},st,{animationName:0,elapsedTime:0,pseudoElement:0}),Lf=Se(Af),zf=H({},st,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Nf=Se(zf),Ff=H({},st,{data:0}),eu=Se(Ff),Mf={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Rf={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Bf={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function If(e){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(e):(e=Bf[e])?!!n[e]:!1}function ro(){return If}var Vf=H({},bt,{key:function(e){if(e.key){var n=Mf[e.key]||e.key;if(n!=="Unidentified")return n}return e.type==="keypress"?(e=xr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Rf[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ro,charCode:function(e){return e.type==="keypress"?xr(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?xr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Hf=Se(Vf),Wf=H({},ii,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),nu=Se(Wf),Uf=H({},bt,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ro}),qf=Se(Uf),Kf=H({},st,{propertyName:0,elapsedTime:0,pseudoElement:0}),Qf=Se(Kf),Yf=H({},ii,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Xf=Se(Yf),Gf=[9,13,27,32],io=Qe&&"CompositionEvent"in window,Et=null;Qe&&"documentMode"in document&&(Et=document.documentMode);var Jf=Qe&&"TextEvent"in window&&!Et,ta=Qe&&(!io||Et&&8<Et&&11>=Et),tu=" ",ru=!1;function ra(e,n){switch(e){case"keyup":return Gf.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function ia(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Rn=!1;function bf(e,n){switch(e){case"compositionend":return ia(n);case"keypress":return n.which!==32?null:(ru=!0,tu);case"textInput":return e=n.data,e===tu&&ru?null:e;default:return null}}function Zf(e,n){if(Rn)return e==="compositionend"||!io&&ra(e,n)?(e=na(),Or=no=rn=null,Rn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return ta&&n.locale!=="ko"?null:n.data;default:return null}}var ed={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function iu(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n==="input"?!!ed[e.type]:n==="textarea"}function la(e,n,t,r){Fs(r),n=Br(n,"onChange"),0<n.length&&(t=new to("onChange","change",null,t,r),e.push({event:t,listeners:n}))}var Pt=null,Bt=null;function nd(e){ga(e,0)}function li(e){var n=Vn(e);if(Cs(n))return e}function td(e,n){if(e==="change")return n}var oa=!1;if(Qe){var Ti;if(Qe){var Di="oninput"in document;if(!Di){var lu=document.createElement("div");lu.setAttribute("oninput","return;"),Di=typeof lu.oninput=="function"}Ti=Di}else Ti=!1;oa=Ti&&(!document.documentMode||9<document.documentMode)}function ou(){Pt&&(Pt.detachEvent("onpropertychange",ua),Bt=Pt=null)}function ua(e){if(e.propertyName==="value"&&li(Bt)){var n=[];la(n,Bt,e,Gl(e)),Is(nd,n)}}function rd(e,n,t){e==="focusin"?(ou(),Pt=n,Bt=t,Pt.attachEvent("onpropertychange",ua)):e==="focusout"&&ou()}function id(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return li(Bt)}function ld(e,n){if(e==="click")return li(n)}function od(e,n){if(e==="input"||e==="change")return li(n)}function ud(e,n){return e===n&&(e!==0||1/e===1/n)||e!==e&&n!==n}var Fe=typeof Object.is=="function"?Object.is:ud;function It(e,n){if(Fe(e,n))return!0;if(typeof e!="object"||e===null||typeof n!="object"||n===null)return!1;var t=Object.keys(e),r=Object.keys(n);if(t.length!==r.length)return!1;for(r=0;r<t.length;r++){var i=t[r];if(!Yi.call(n,i)||!Fe(e[i],n[i]))return!1}return!0}function uu(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function su(e,n){var t=uu(e);e=0;for(var r;t;){if(t.nodeType===3){if(r=e+t.textContent.length,e<=n&&r>=n)return{node:t,offset:n-e};e=r}e:{for(;t;){if(t.nextSibling){t=t.nextSibling;break e}t=t.parentNode}t=void 0}t=uu(t)}}function sa(e,n){return e&&n?e===n?!0:e&&e.nodeType===3?!1:n&&n.nodeType===3?sa(e,n.parentNode):"contains"in e?e.contains(n):e.compareDocumentPosition?!!(e.compareDocumentPosition(n)&16):!1:!1}function aa(){for(var e=window,n=Ar();n instanceof e.HTMLIFrameElement;){try{var t=typeof n.contentWindow.location.href=="string"}catch{t=!1}if(t)e=n.contentWindow;else break;n=Ar(e.document)}return n}function lo(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n&&(n==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||n==="textarea"||e.contentEditable==="true")}function sd(e){var n=aa(),t=e.focusedElem,r=e.selectionRange;if(n!==t&&t&&t.ownerDocument&&sa(t.ownerDocument.documentElement,t)){if(r!==null&&lo(t)){if(n=r.start,e=r.end,e===void 0&&(e=n),"selectionStart"in t)t.selectionStart=n,t.selectionEnd=Math.min(e,t.value.length);else if(e=(n=t.ownerDocument||document)&&n.defaultView||window,e.getSelection){e=e.getSelection();var i=t.textContent.length,l=Math.min(r.start,i);r=r.end===void 0?l:Math.min(r.end,i),!e.extend&&l>r&&(i=r,r=l,l=i),i=su(t,l);var o=su(t,r);i&&o&&(e.rangeCount!==1||e.anchorNode!==i.node||e.anchorOffset!==i.offset||e.focusNode!==o.node||e.focusOffset!==o.offset)&&(n=n.createRange(),n.setStart(i.node,i.offset),e.removeAllRanges(),l>r?(e.addRange(n),e.extend(o.node,o.offset)):(n.setEnd(o.node,o.offset),e.addRange(n)))}}for(n=[],e=t;e=e.parentNode;)e.nodeType===1&&n.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof t.focus=="function"&&t.focus(),t=0;t<n.length;t++)e=n[t],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var ad=Qe&&"documentMode"in document&&11>=document.documentMode,Bn=null,pl=null,jt=null,ml=!1;function au(e,n,t){var r=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;ml||Bn==null||Bn!==Ar(r)||(r=Bn,"selectionStart"in r&&lo(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),jt&&It(jt,r)||(jt=r,r=Br(pl,"onSelect"),0<r.length&&(n=new to("onSelect","select",null,n,t),e.push({event:n,listeners:r}),n.target=Bn)))}function fr(e,n){var t={};return t[e.toLowerCase()]=n.toLowerCase(),t["Webkit"+e]="webkit"+n,t["Moz"+e]="moz"+n,t}var In={animationend:fr("Animation","AnimationEnd"),animationiteration:fr("Animation","AnimationIteration"),animationstart:fr("Animation","AnimationStart"),transitionend:fr("Transition","TransitionEnd")},Ai={},ca={};Qe&&(ca=document.createElement("div").style,"AnimationEvent"in window||(delete In.animationend.animation,delete In.animationiteration.animation,delete In.animationstart.animation),"TransitionEvent"in window||delete In.transitionend.transition);function oi(e){if(Ai[e])return Ai[e];if(!In[e])return e;var n=In[e],t;for(t in n)if(n.hasOwnProperty(t)&&t in ca)return Ai[e]=n[t];return e}var fa=oi("animationend"),da=oi("animationiteration"),pa=oi("animationstart"),ma=oi("transitionend"),ha=new Map,cu="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function gn(e,n){ha.set(e,n),Ln(n,[e])}for(var Li=0;Li<cu.length;Li++){var zi=cu[Li],cd=zi.toLowerCase(),fd=zi[0].toUpperCase()+zi.slice(1);gn(cd,"on"+fd)}gn(fa,"onAnimationEnd");gn(da,"onAnimationIteration");gn(pa,"onAnimationStart");gn("dblclick","onDoubleClick");gn("focusin","onFocus");gn("focusout","onBlur");gn(ma,"onTransitionEnd");et("onMouseEnter",["mouseout","mouseover"]);et("onMouseLeave",["mouseout","mouseover"]);et("onPointerEnter",["pointerout","pointerover"]);et("onPointerLeave",["pointerout","pointerover"]);Ln("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ln("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ln("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ln("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ln("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ln("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ot="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),dd=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ot));function fu(e,n,t){var r=e.type||"unknown-event";e.currentTarget=t,cf(r,n,void 0,e),e.currentTarget=null}function ga(e,n){n=(n&4)!==0;for(var t=0;t<e.length;t++){var r=e[t],i=r.event;r=r.listeners;e:{var l=void 0;if(n)for(var o=r.length-1;0<=o;o--){var u=r[o],s=u.instance,c=u.currentTarget;if(u=u.listener,s!==l&&i.isPropagationStopped())break e;fu(i,u,c),l=s}else for(o=0;o<r.length;o++){if(u=r[o],s=u.instance,c=u.currentTarget,u=u.listener,s!==l&&i.isPropagationStopped())break e;fu(i,u,c),l=s}}}if(zr)throw e=al,zr=!1,al=null,e}function F(e,n){var t=n[wl];t===void 0&&(t=n[wl]=new Set);var r=e+"__bubble";t.has(r)||(ya(n,e,2,!1),t.add(r))}function Ni(e,n,t){var r=0;n&&(r|=4),ya(t,e,r,n)}var dr="_reactListening"+Math.random().toString(36).slice(2);function Vt(e){if(!e[dr]){e[dr]=!0,xs.forEach(function(t){t!=="selectionchange"&&(dd.has(t)||Ni(t,!1,e),Ni(t,!0,e))});var n=e.nodeType===9?e:e.ownerDocument;n===null||n[dr]||(n[dr]=!0,Ni("selectionchange",!1,n))}}function ya(e,n,t,r){switch(ea(n)){case 1:var i=Ef;break;case 4:i=Pf;break;default:i=eo}t=i.bind(null,n,t,e),i=void 0,!sl||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(i=!0),r?i!==void 0?e.addEventListener(n,t,{capture:!0,passive:i}):e.addEventListener(n,t,!0):i!==void 0?e.addEventListener(n,t,{passive:i}):e.addEventListener(n,t,!1)}function Fi(e,n,t,r,i){var l=r;if(!(n&1)&&!(n&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var u=r.stateNode.containerInfo;if(u===i||u.nodeType===8&&u.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var s=o.tag;if((s===3||s===4)&&(s=o.stateNode.containerInfo,s===i||s.nodeType===8&&s.parentNode===i))return;o=o.return}for(;u!==null;){if(o=On(u),o===null)return;if(s=o.tag,s===5||s===6){r=l=o;continue e}u=u.parentNode}}r=r.return}Is(function(){var c=l,h=Gl(t),p=[];e:{var m=ha.get(e);if(m!==void 0){var v=to,w=e;switch(e){case"keypress":if(xr(t)===0)break e;case"keydown":case"keyup":v=Hf;break;case"focusin":w="focus",v=Ci;break;case"focusout":w="blur",v=Ci;break;case"beforeblur":case"afterblur":v=Ci;break;case"click":if(t.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":v=Zo;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":v=Tf;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":v=qf;break;case fa:case da:case pa:v=Lf;break;case ma:v=Qf;break;case"scroll":v=jf;break;case"wheel":v=Xf;break;case"copy":case"cut":case"paste":v=Nf;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":v=nu}var k=(n&4)!==0,R=!k&&e==="scroll",f=k?m!==null?m+"Capture":null:m;k=[];for(var a=c,d;a!==null;){d=a;var g=d.stateNode;if(d.tag===5&&g!==null&&(d=g,f!==null&&(g=Nt(a,f),g!=null&&k.push(Ht(a,g,d)))),R)break;a=a.return}0<k.length&&(m=new v(m,w,null,t,h),p.push({event:m,listeners:k}))}}if(!(n&7)){e:{if(m=e==="mouseover"||e==="pointerover",v=e==="mouseout"||e==="pointerout",m&&t!==ol&&(w=t.relatedTarget||t.fromElement)&&(On(w)||w[Ye]))break e;if((v||m)&&(m=h.window===h?h:(m=h.ownerDocument)?m.defaultView||m.parentWindow:window,v?(w=t.relatedTarget||t.toElement,v=c,w=w?On(w):null,w!==null&&(R=zn(w),w!==R||w.tag!==5&&w.tag!==6)&&(w=null)):(v=null,w=c),v!==w)){if(k=Zo,g="onMouseLeave",f="onMouseEnter",a="mouse",(e==="pointerout"||e==="pointerover")&&(k=nu,g="onPointerLeave",f="onPointerEnter",a="pointer"),R=v==null?m:Vn(v),d=w==null?m:Vn(w),m=new k(g,a+"leave",v,t,h),m.target=R,m.relatedTarget=d,g=null,On(h)===c&&(k=new k(f,a+"enter",w,t,h),k.target=d,k.relatedTarget=R,g=k),R=g,v&&w)n:{for(k=v,f=w,a=0,d=k;d;d=Nn(d))a++;for(d=0,g=f;g;g=Nn(g))d++;for(;0<a-d;)k=Nn(k),a--;for(;0<d-a;)f=Nn(f),d--;for(;a--;){if(k===f||f!==null&&k===f.alternate)break n;k=Nn(k),f=Nn(f)}k=null}else k=null;v!==null&&du(p,m,v,k,!1),w!==null&&R!==null&&du(p,R,w,k,!0)}}e:{if(m=c?Vn(c):window,v=m.nodeName&&m.nodeName.toLowerCase(),v==="select"||v==="input"&&m.type==="file")var _=td;else if(iu(m))if(oa)_=od;else{_=id;var $=rd}else(v=m.nodeName)&&v.toLowerCase()==="input"&&(m.type==="checkbox"||m.type==="radio")&&(_=ld);if(_&&(_=_(e,c))){la(p,_,t,h);break e}$&&$(e,m,c),e==="focusout"&&($=m._wrapperState)&&$.controlled&&m.type==="number"&&nl(m,"number",m.value)}switch($=c?Vn(c):window,e){case"focusin":(iu($)||$.contentEditable==="true")&&(Bn=$,pl=c,jt=null);break;case"focusout":jt=pl=Bn=null;break;case"mousedown":ml=!0;break;case"contextmenu":case"mouseup":case"dragend":ml=!1,au(p,t,h);break;case"selectionchange":if(ad)break;case"keydown":case"keyup":au(p,t,h)}var E;if(io)e:{switch(e){case"compositionstart":var P="onCompositionStart";break e;case"compositionend":P="onCompositionEnd";break e;case"compositionupdate":P="onCompositionUpdate";break e}P=void 0}else Rn?ra(e,t)&&(P="onCompositionEnd"):e==="keydown"&&t.keyCode===229&&(P="onCompositionStart");P&&(ta&&t.locale!=="ko"&&(Rn||P!=="onCompositionStart"?P==="onCompositionEnd"&&Rn&&(E=na()):(rn=h,no="value"in rn?rn.value:rn.textContent,Rn=!0)),$=Br(c,P),0<$.length&&(P=new eu(P,e,null,t,h),p.push({event:P,listeners:$}),E?P.data=E:(E=ia(t),E!==null&&(P.data=E)))),(E=Jf?bf(e,t):Zf(e,t))&&(c=Br(c,"onBeforeInput"),0<c.length&&(h=new eu("onBeforeInput","beforeinput",null,t,h),p.push({event:h,listeners:c}),h.data=E))}ga(p,n)})}function Ht(e,n,t){return{instance:e,listener:n,currentTarget:t}}function Br(e,n){for(var t=n+"Capture",r=[];e!==null;){var i=e,l=i.stateNode;i.tag===5&&l!==null&&(i=l,l=Nt(e,t),l!=null&&r.unshift(Ht(e,l,i)),l=Nt(e,n),l!=null&&r.push(Ht(e,l,i))),e=e.return}return r}function Nn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function du(e,n,t,r,i){for(var l=n._reactName,o=[];t!==null&&t!==r;){var u=t,s=u.alternate,c=u.stateNode;if(s!==null&&s===r)break;u.tag===5&&c!==null&&(u=c,i?(s=Nt(t,l),s!=null&&o.unshift(Ht(t,s,u))):i||(s=Nt(t,l),s!=null&&o.push(Ht(t,s,u)))),t=t.return}o.length!==0&&e.push({event:n,listeners:o})}var pd=/\r\n?/g,md=/\u0000|\uFFFD/g;function pu(e){return(typeof e=="string"?e:""+e).replace(pd,`
`).replace(md,"")}function pr(e,n,t){if(n=pu(n),pu(e)!==n&&t)throw Error(y(425))}function Ir(){}var hl=null,gl=null;function yl(e,n){return e==="textarea"||e==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var vl=typeof setTimeout=="function"?setTimeout:void 0,hd=typeof clearTimeout=="function"?clearTimeout:void 0,mu=typeof Promise=="function"?Promise:void 0,gd=typeof queueMicrotask=="function"?queueMicrotask:typeof mu<"u"?function(e){return mu.resolve(null).then(e).catch(yd)}:vl;function yd(e){setTimeout(function(){throw e})}function Mi(e,n){var t=n,r=0;do{var i=t.nextSibling;if(e.removeChild(t),i&&i.nodeType===8)if(t=i.data,t==="/$"){if(r===0){e.removeChild(i),Rt(n);return}r--}else t!=="$"&&t!=="$?"&&t!=="$!"||r++;t=i}while(t);Rt(n)}function an(e){for(;e!=null;e=e.nextSibling){var n=e.nodeType;if(n===1||n===3)break;if(n===8){if(n=e.data,n==="$"||n==="$!"||n==="$?")break;if(n==="/$")return null}}return e}function hu(e){e=e.previousSibling;for(var n=0;e;){if(e.nodeType===8){var t=e.data;if(t==="$"||t==="$!"||t==="$?"){if(n===0)return e;n--}else t==="/$"&&n++}e=e.previousSibling}return null}var at=Math.random().toString(36).slice(2),Be="__reactFiber$"+at,Wt="__reactProps$"+at,Ye="__reactContainer$"+at,wl="__reactEvents$"+at,vd="__reactListeners$"+at,wd="__reactHandles$"+at;function On(e){var n=e[Be];if(n)return n;for(var t=e.parentNode;t;){if(n=t[Ye]||t[Be]){if(t=n.alternate,n.child!==null||t!==null&&t.child!==null)for(e=hu(e);e!==null;){if(t=e[Be])return t;e=hu(e)}return n}e=t,t=e.parentNode}return null}function Zt(e){return e=e[Be]||e[Ye],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Vn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(y(33))}function ui(e){return e[Wt]||null}var kl=[],Hn=-1;function yn(e){return{current:e}}function M(e){0>Hn||(e.current=kl[Hn],kl[Hn]=null,Hn--)}function N(e,n){Hn++,kl[Hn]=e.current,e.current=n}var hn={},oe=yn(hn),pe=yn(!1),jn=hn;function nt(e,n){var t=e.type.contextTypes;if(!t)return hn;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===n)return r.__reactInternalMemoizedMaskedChildContext;var i={},l;for(l in t)i[l]=n[l];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=n,e.__reactInternalMemoizedMaskedChildContext=i),i}function me(e){return e=e.childContextTypes,e!=null}function Vr(){M(pe),M(oe)}function gu(e,n,t){if(oe.current!==hn)throw Error(y(168));N(oe,n),N(pe,t)}function va(e,n,t){var r=e.stateNode;if(n=n.childContextTypes,typeof r.getChildContext!="function")return t;r=r.getChildContext();for(var i in r)if(!(i in n))throw Error(y(108,tf(e)||"Unknown",i));return H({},t,r)}function Hr(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||hn,jn=oe.current,N(oe,e),N(pe,pe.current),!0}function yu(e,n,t){var r=e.stateNode;if(!r)throw Error(y(169));t?(e=va(e,n,jn),r.__reactInternalMemoizedMergedChildContext=e,M(pe),M(oe),N(oe,e)):M(pe),N(pe,t)}var We=null,si=!1,Ri=!1;function wa(e){We===null?We=[e]:We.push(e)}function kd(e){si=!0,wa(e)}function vn(){if(!Ri&&We!==null){Ri=!0;var e=0,n=z;try{var t=We;for(z=1;e<t.length;e++){var r=t[e];do r=r(!0);while(r!==null)}We=null,si=!1}catch(i){throw We!==null&&(We=We.slice(e+1)),Us(Jl,vn),i}finally{z=n,Ri=!1}}return null}var Wn=[],Un=0,Wr=null,Ur=0,_e=[],Oe=0,Cn=null,Ue=1,qe="";function Sn(e,n){Wn[Un++]=Ur,Wn[Un++]=Wr,Wr=e,Ur=n}function ka(e,n,t){_e[Oe++]=Ue,_e[Oe++]=qe,_e[Oe++]=Cn,Cn=e;var r=Ue;e=qe;var i=32-ze(r)-1;r&=~(1<<i),t+=1;var l=32-ze(n)+i;if(30<l){var o=i-i%5;l=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ue=1<<32-ze(n)+i|t<<i|r,qe=l+e}else Ue=1<<l|t<<i|r,qe=e}function oo(e){e.return!==null&&(Sn(e,1),ka(e,1,0))}function uo(e){for(;e===Wr;)Wr=Wn[--Un],Wn[Un]=null,Ur=Wn[--Un],Wn[Un]=null;for(;e===Cn;)Cn=_e[--Oe],_e[Oe]=null,qe=_e[--Oe],_e[Oe]=null,Ue=_e[--Oe],_e[Oe]=null}var ve=null,ye=null,B=!1,Ae=null;function Sa(e,n){var t=xe(5,null,null,0);t.elementType="DELETED",t.stateNode=n,t.return=e,n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)}function vu(e,n){switch(e.tag){case 5:var t=e.type;return n=n.nodeType!==1||t.toLowerCase()!==n.nodeName.toLowerCase()?null:n,n!==null?(e.stateNode=n,ve=e,ye=an(n.firstChild),!0):!1;case 6:return n=e.pendingProps===""||n.nodeType!==3?null:n,n!==null?(e.stateNode=n,ve=e,ye=null,!0):!1;case 13:return n=n.nodeType!==8?null:n,n!==null?(t=Cn!==null?{id:Ue,overflow:qe}:null,e.memoizedState={dehydrated:n,treeContext:t,retryLane:1073741824},t=xe(18,null,null,0),t.stateNode=n,t.return=e,e.child=t,ve=e,ye=null,!0):!1;default:return!1}}function Sl(e){return(e.mode&1)!==0&&(e.flags&128)===0}function _l(e){if(B){var n=ye;if(n){var t=n;if(!vu(e,n)){if(Sl(e))throw Error(y(418));n=an(t.nextSibling);var r=ve;n&&vu(e,n)?Sa(r,t):(e.flags=e.flags&-4097|2,B=!1,ve=e)}}else{if(Sl(e))throw Error(y(418));e.flags=e.flags&-4097|2,B=!1,ve=e}}}function wu(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;ve=e}function mr(e){if(e!==ve)return!1;if(!B)return wu(e),B=!0,!1;var n;if((n=e.tag!==3)&&!(n=e.tag!==5)&&(n=e.type,n=n!=="head"&&n!=="body"&&!yl(e.type,e.memoizedProps)),n&&(n=ye)){if(Sl(e))throw _a(),Error(y(418));for(;n;)Sa(e,n),n=an(n.nextSibling)}if(wu(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(y(317));e:{for(e=e.nextSibling,n=0;e;){if(e.nodeType===8){var t=e.data;if(t==="/$"){if(n===0){ye=an(e.nextSibling);break e}n--}else t!=="$"&&t!=="$!"&&t!=="$?"||n++}e=e.nextSibling}ye=null}}else ye=ve?an(e.stateNode.nextSibling):null;return!0}function _a(){for(var e=ye;e;)e=an(e.nextSibling)}function tt(){ye=ve=null,B=!1}function so(e){Ae===null?Ae=[e]:Ae.push(e)}var Sd=Je.ReactCurrentBatchConfig;function yt(e,n,t){if(e=t.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(t._owner){if(t=t._owner,t){if(t.tag!==1)throw Error(y(309));var r=t.stateNode}if(!r)throw Error(y(147,e));var i=r,l=""+e;return n!==null&&n.ref!==null&&typeof n.ref=="function"&&n.ref._stringRef===l?n.ref:(n=function(o){var u=i.refs;o===null?delete u[l]:u[l]=o},n._stringRef=l,n)}if(typeof e!="string")throw Error(y(284));if(!t._owner)throw Error(y(290,e))}return e}function hr(e,n){throw e=Object.prototype.toString.call(n),Error(y(31,e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e))}function ku(e){var n=e._init;return n(e._payload)}function Oa(e){function n(f,a){if(e){var d=f.deletions;d===null?(f.deletions=[a],f.flags|=16):d.push(a)}}function t(f,a){if(!e)return null;for(;a!==null;)n(f,a),a=a.sibling;return null}function r(f,a){for(f=new Map;a!==null;)a.key!==null?f.set(a.key,a):f.set(a.index,a),a=a.sibling;return f}function i(f,a){return f=pn(f,a),f.index=0,f.sibling=null,f}function l(f,a,d){return f.index=d,e?(d=f.alternate,d!==null?(d=d.index,d<a?(f.flags|=2,a):d):(f.flags|=2,a)):(f.flags|=1048576,a)}function o(f){return e&&f.alternate===null&&(f.flags|=2),f}function u(f,a,d,g){return a===null||a.tag!==6?(a=qi(d,f.mode,g),a.return=f,a):(a=i(a,d),a.return=f,a)}function s(f,a,d,g){var _=d.type;return _===Mn?h(f,a,d.props.children,g,d.key):a!==null&&(a.elementType===_||typeof _=="object"&&_!==null&&_.$$typeof===Ze&&ku(_)===a.type)?(g=i(a,d.props),g.ref=yt(f,a,d),g.return=f,g):(g=Dr(d.type,d.key,d.props,null,f.mode,g),g.ref=yt(f,a,d),g.return=f,g)}function c(f,a,d,g){return a===null||a.tag!==4||a.stateNode.containerInfo!==d.containerInfo||a.stateNode.implementation!==d.implementation?(a=Ki(d,f.mode,g),a.return=f,a):(a=i(a,d.children||[]),a.return=f,a)}function h(f,a,d,g,_){return a===null||a.tag!==7?(a=Pn(d,f.mode,g,_),a.return=f,a):(a=i(a,d),a.return=f,a)}function p(f,a,d){if(typeof a=="string"&&a!==""||typeof a=="number")return a=qi(""+a,f.mode,d),a.return=f,a;if(typeof a=="object"&&a!==null){switch(a.$$typeof){case ir:return d=Dr(a.type,a.key,a.props,null,f.mode,d),d.ref=yt(f,null,a),d.return=f,d;case Fn:return a=Ki(a,f.mode,d),a.return=f,a;case Ze:var g=a._init;return p(f,g(a._payload),d)}if(St(a)||dt(a))return a=Pn(a,f.mode,d,null),a.return=f,a;hr(f,a)}return null}function m(f,a,d,g){var _=a!==null?a.key:null;if(typeof d=="string"&&d!==""||typeof d=="number")return _!==null?null:u(f,a,""+d,g);if(typeof d=="object"&&d!==null){switch(d.$$typeof){case ir:return d.key===_?s(f,a,d,g):null;case Fn:return d.key===_?c(f,a,d,g):null;case Ze:return _=d._init,m(f,a,_(d._payload),g)}if(St(d)||dt(d))return _!==null?null:h(f,a,d,g,null);hr(f,d)}return null}function v(f,a,d,g,_){if(typeof g=="string"&&g!==""||typeof g=="number")return f=f.get(d)||null,u(a,f,""+g,_);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case ir:return f=f.get(g.key===null?d:g.key)||null,s(a,f,g,_);case Fn:return f=f.get(g.key===null?d:g.key)||null,c(a,f,g,_);case Ze:var $=g._init;return v(f,a,d,$(g._payload),_)}if(St(g)||dt(g))return f=f.get(d)||null,h(a,f,g,_,null);hr(a,g)}return null}function w(f,a,d,g){for(var _=null,$=null,E=a,P=a=0,U=null;E!==null&&P<d.length;P++){E.index>P?(U=E,E=null):U=E.sibling;var A=m(f,E,d[P],g);if(A===null){E===null&&(E=U);break}e&&E&&A.alternate===null&&n(f,E),a=l(A,a,P),$===null?_=A:$.sibling=A,$=A,E=U}if(P===d.length)return t(f,E),B&&Sn(f,P),_;if(E===null){for(;P<d.length;P++)E=p(f,d[P],g),E!==null&&(a=l(E,a,P),$===null?_=E:$.sibling=E,$=E);return B&&Sn(f,P),_}for(E=r(f,E);P<d.length;P++)U=v(E,f,P,d[P],g),U!==null&&(e&&U.alternate!==null&&E.delete(U.key===null?P:U.key),a=l(U,a,P),$===null?_=U:$.sibling=U,$=U);return e&&E.forEach(function(je){return n(f,je)}),B&&Sn(f,P),_}function k(f,a,d,g){var _=dt(d);if(typeof _!="function")throw Error(y(150));if(d=_.call(d),d==null)throw Error(y(151));for(var $=_=null,E=a,P=a=0,U=null,A=d.next();E!==null&&!A.done;P++,A=d.next()){E.index>P?(U=E,E=null):U=E.sibling;var je=m(f,E,A.value,g);if(je===null){E===null&&(E=U);break}e&&E&&je.alternate===null&&n(f,E),a=l(je,a,P),$===null?_=je:$.sibling=je,$=je,E=U}if(A.done)return t(f,E),B&&Sn(f,P),_;if(E===null){for(;!A.done;P++,A=d.next())A=p(f,A.value,g),A!==null&&(a=l(A,a,P),$===null?_=A:$.sibling=A,$=A);return B&&Sn(f,P),_}for(E=r(f,E);!A.done;P++,A=d.next())A=v(E,f,P,A.value,g),A!==null&&(e&&A.alternate!==null&&E.delete(A.key===null?P:A.key),a=l(A,a,P),$===null?_=A:$.sibling=A,$=A);return e&&E.forEach(function(ct){return n(f,ct)}),B&&Sn(f,P),_}function R(f,a,d,g){if(typeof d=="object"&&d!==null&&d.type===Mn&&d.key===null&&(d=d.props.children),typeof d=="object"&&d!==null){switch(d.$$typeof){case ir:e:{for(var _=d.key,$=a;$!==null;){if($.key===_){if(_=d.type,_===Mn){if($.tag===7){t(f,$.sibling),a=i($,d.props.children),a.return=f,f=a;break e}}else if($.elementType===_||typeof _=="object"&&_!==null&&_.$$typeof===Ze&&ku(_)===$.type){t(f,$.sibling),a=i($,d.props),a.ref=yt(f,$,d),a.return=f,f=a;break e}t(f,$);break}else n(f,$);$=$.sibling}d.type===Mn?(a=Pn(d.props.children,f.mode,g,d.key),a.return=f,f=a):(g=Dr(d.type,d.key,d.props,null,f.mode,g),g.ref=yt(f,a,d),g.return=f,f=g)}return o(f);case Fn:e:{for($=d.key;a!==null;){if(a.key===$)if(a.tag===4&&a.stateNode.containerInfo===d.containerInfo&&a.stateNode.implementation===d.implementation){t(f,a.sibling),a=i(a,d.children||[]),a.return=f,f=a;break e}else{t(f,a);break}else n(f,a);a=a.sibling}a=Ki(d,f.mode,g),a.return=f,f=a}return o(f);case Ze:return $=d._init,R(f,a,$(d._payload),g)}if(St(d))return w(f,a,d,g);if(dt(d))return k(f,a,d,g);hr(f,d)}return typeof d=="string"&&d!==""||typeof d=="number"?(d=""+d,a!==null&&a.tag===6?(t(f,a.sibling),a=i(a,d),a.return=f,f=a):(t(f,a),a=qi(d,f.mode,g),a.return=f,f=a),o(f)):t(f,a)}return R}var rt=Oa(!0),xa=Oa(!1),qr=yn(null),Kr=null,qn=null,ao=null;function co(){ao=qn=Kr=null}function fo(e){var n=qr.current;M(qr),e._currentValue=n}function Ol(e,n,t){for(;e!==null;){var r=e.alternate;if((e.childLanes&n)!==n?(e.childLanes|=n,r!==null&&(r.childLanes|=n)):r!==null&&(r.childLanes&n)!==n&&(r.childLanes|=n),e===t)break;e=e.return}}function bn(e,n){Kr=e,ao=qn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&n&&(de=!0),e.firstContext=null)}function Ee(e){var n=e._currentValue;if(ao!==e)if(e={context:e,memoizedValue:n,next:null},qn===null){if(Kr===null)throw Error(y(308));qn=e,Kr.dependencies={lanes:0,firstContext:e}}else qn=qn.next=e;return n}var xn=null;function po(e){xn===null?xn=[e]:xn.push(e)}function $a(e,n,t,r){var i=n.interleaved;return i===null?(t.next=t,po(n)):(t.next=i.next,i.next=t),n.interleaved=t,Xe(e,r)}function Xe(e,n){e.lanes|=n;var t=e.alternate;for(t!==null&&(t.lanes|=n),t=e,e=e.return;e!==null;)e.childLanes|=n,t=e.alternate,t!==null&&(t.childLanes|=n),t=e,e=e.return;return t.tag===3?t.stateNode:null}var en=!1;function mo(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ea(e,n){e=e.updateQueue,n.updateQueue===e&&(n.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Ke(e,n){return{eventTime:e,lane:n,tag:0,payload:null,callback:null,next:null}}function cn(e,n,t){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,L&2){var i=r.pending;return i===null?n.next=n:(n.next=i.next,i.next=n),r.pending=n,Xe(e,t)}return i=r.interleaved,i===null?(n.next=n,po(r)):(n.next=i.next,i.next=n),r.interleaved=n,Xe(e,t)}function $r(e,n,t){if(n=n.updateQueue,n!==null&&(n=n.shared,(t&4194240)!==0)){var r=n.lanes;r&=e.pendingLanes,t|=r,n.lanes=t,bl(e,t)}}function Su(e,n){var t=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,t===r)){var i=null,l=null;if(t=t.firstBaseUpdate,t!==null){do{var o={eventTime:t.eventTime,lane:t.lane,tag:t.tag,payload:t.payload,callback:t.callback,next:null};l===null?i=l=o:l=l.next=o,t=t.next}while(t!==null);l===null?i=l=n:l=l.next=n}else i=l=n;t={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:l,shared:r.shared,effects:r.effects},e.updateQueue=t;return}e=t.lastBaseUpdate,e===null?t.firstBaseUpdate=n:e.next=n,t.lastBaseUpdate=n}function Qr(e,n,t,r){var i=e.updateQueue;en=!1;var l=i.firstBaseUpdate,o=i.lastBaseUpdate,u=i.shared.pending;if(u!==null){i.shared.pending=null;var s=u,c=s.next;s.next=null,o===null?l=c:o.next=c,o=s;var h=e.alternate;h!==null&&(h=h.updateQueue,u=h.lastBaseUpdate,u!==o&&(u===null?h.firstBaseUpdate=c:u.next=c,h.lastBaseUpdate=s))}if(l!==null){var p=i.baseState;o=0,h=c=s=null,u=l;do{var m=u.lane,v=u.eventTime;if((r&m)===m){h!==null&&(h=h.next={eventTime:v,lane:0,tag:u.tag,payload:u.payload,callback:u.callback,next:null});e:{var w=e,k=u;switch(m=n,v=t,k.tag){case 1:if(w=k.payload,typeof w=="function"){p=w.call(v,p,m);break e}p=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=k.payload,m=typeof w=="function"?w.call(v,p,m):w,m==null)break e;p=H({},p,m);break e;case 2:en=!0}}u.callback!==null&&u.lane!==0&&(e.flags|=64,m=i.effects,m===null?i.effects=[u]:m.push(u))}else v={eventTime:v,lane:m,tag:u.tag,payload:u.payload,callback:u.callback,next:null},h===null?(c=h=v,s=p):h=h.next=v,o|=m;if(u=u.next,u===null){if(u=i.shared.pending,u===null)break;m=u,u=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(!0);if(h===null&&(s=p),i.baseState=s,i.firstBaseUpdate=c,i.lastBaseUpdate=h,n=i.shared.interleaved,n!==null){i=n;do o|=i.lane,i=i.next;while(i!==n)}else l===null&&(i.shared.lanes=0);Dn|=o,e.lanes=o,e.memoizedState=p}}function _u(e,n,t){if(e=n.effects,n.effects=null,e!==null)for(n=0;n<e.length;n++){var r=e[n],i=r.callback;if(i!==null){if(r.callback=null,r=t,typeof i!="function")throw Error(y(191,i));i.call(r)}}}var er={},Ve=yn(er),Ut=yn(er),qt=yn(er);function $n(e){if(e===er)throw Error(y(174));return e}function ho(e,n){switch(N(qt,n),N(Ut,e),N(Ve,er),e=n.nodeType,e){case 9:case 11:n=(n=n.documentElement)?n.namespaceURI:rl(null,"");break;default:e=e===8?n.parentNode:n,n=e.namespaceURI||null,e=e.tagName,n=rl(n,e)}M(Ve),N(Ve,n)}function it(){M(Ve),M(Ut),M(qt)}function Pa(e){$n(qt.current);var n=$n(Ve.current),t=rl(n,e.type);n!==t&&(N(Ut,e),N(Ve,t))}function go(e){Ut.current===e&&(M(Ve),M(Ut))}var I=yn(0);function Yr(e){for(var n=e;n!==null;){if(n.tag===13){var t=n.memoizedState;if(t!==null&&(t=t.dehydrated,t===null||t.data==="$?"||t.data==="$!"))return n}else if(n.tag===19&&n.memoizedProps.revealOrder!==void 0){if(n.flags&128)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var Bi=[];function yo(){for(var e=0;e<Bi.length;e++)Bi[e]._workInProgressVersionPrimary=null;Bi.length=0}var Er=Je.ReactCurrentDispatcher,Ii=Je.ReactCurrentBatchConfig,Tn=0,V=null,Y=null,J=null,Xr=!1,Ct=!1,Kt=0,_d=0;function re(){throw Error(y(321))}function vo(e,n){if(n===null)return!1;for(var t=0;t<n.length&&t<e.length;t++)if(!Fe(e[t],n[t]))return!1;return!0}function wo(e,n,t,r,i,l){if(Tn=l,V=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,Er.current=e===null||e.memoizedState===null?Ed:Pd,e=t(r,i),Ct){l=0;do{if(Ct=!1,Kt=0,25<=l)throw Error(y(301));l+=1,J=Y=null,n.updateQueue=null,Er.current=jd,e=t(r,i)}while(Ct)}if(Er.current=Gr,n=Y!==null&&Y.next!==null,Tn=0,J=Y=V=null,Xr=!1,n)throw Error(y(300));return e}function ko(){var e=Kt!==0;return Kt=0,e}function Re(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return J===null?V.memoizedState=J=e:J=J.next=e,J}function Pe(){if(Y===null){var e=V.alternate;e=e!==null?e.memoizedState:null}else e=Y.next;var n=J===null?V.memoizedState:J.next;if(n!==null)J=n,Y=e;else{if(e===null)throw Error(y(310));Y=e,e={memoizedState:Y.memoizedState,baseState:Y.baseState,baseQueue:Y.baseQueue,queue:Y.queue,next:null},J===null?V.memoizedState=J=e:J=J.next=e}return J}function Qt(e,n){return typeof n=="function"?n(e):n}function Vi(e){var n=Pe(),t=n.queue;if(t===null)throw Error(y(311));t.lastRenderedReducer=e;var r=Y,i=r.baseQueue,l=t.pending;if(l!==null){if(i!==null){var o=i.next;i.next=l.next,l.next=o}r.baseQueue=i=l,t.pending=null}if(i!==null){l=i.next,r=r.baseState;var u=o=null,s=null,c=l;do{var h=c.lane;if((Tn&h)===h)s!==null&&(s=s.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:e(r,c.action);else{var p={lane:h,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};s===null?(u=s=p,o=r):s=s.next=p,V.lanes|=h,Dn|=h}c=c.next}while(c!==null&&c!==l);s===null?o=r:s.next=u,Fe(r,n.memoizedState)||(de=!0),n.memoizedState=r,n.baseState=o,n.baseQueue=s,t.lastRenderedState=r}if(e=t.interleaved,e!==null){i=e;do l=i.lane,V.lanes|=l,Dn|=l,i=i.next;while(i!==e)}else i===null&&(t.lanes=0);return[n.memoizedState,t.dispatch]}function Hi(e){var n=Pe(),t=n.queue;if(t===null)throw Error(y(311));t.lastRenderedReducer=e;var r=t.dispatch,i=t.pending,l=n.memoizedState;if(i!==null){t.pending=null;var o=i=i.next;do l=e(l,o.action),o=o.next;while(o!==i);Fe(l,n.memoizedState)||(de=!0),n.memoizedState=l,n.baseQueue===null&&(n.baseState=l),t.lastRenderedState=l}return[l,r]}function ja(){}function Ca(e,n){var t=V,r=Pe(),i=n(),l=!Fe(r.memoizedState,i);if(l&&(r.memoizedState=i,de=!0),r=r.queue,So(Aa.bind(null,t,r,e),[e]),r.getSnapshot!==n||l||J!==null&&J.memoizedState.tag&1){if(t.flags|=2048,Yt(9,Da.bind(null,t,r,i,n),void 0,null),b===null)throw Error(y(349));Tn&30||Ta(t,n,i)}return i}function Ta(e,n,t){e.flags|=16384,e={getSnapshot:n,value:t},n=V.updateQueue,n===null?(n={lastEffect:null,stores:null},V.updateQueue=n,n.stores=[e]):(t=n.stores,t===null?n.stores=[e]:t.push(e))}function Da(e,n,t,r){n.value=t,n.getSnapshot=r,La(n)&&za(e)}function Aa(e,n,t){return t(function(){La(n)&&za(e)})}function La(e){var n=e.getSnapshot;e=e.value;try{var t=n();return!Fe(e,t)}catch{return!0}}function za(e){var n=Xe(e,1);n!==null&&Ne(n,e,1,-1)}function Ou(e){var n=Re();return typeof e=="function"&&(e=e()),n.memoizedState=n.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Qt,lastRenderedState:e},n.queue=e,e=e.dispatch=$d.bind(null,V,e),[n.memoizedState,e]}function Yt(e,n,t,r){return e={tag:e,create:n,destroy:t,deps:r,next:null},n=V.updateQueue,n===null?(n={lastEffect:null,stores:null},V.updateQueue=n,n.lastEffect=e.next=e):(t=n.lastEffect,t===null?n.lastEffect=e.next=e:(r=t.next,t.next=e,e.next=r,n.lastEffect=e)),e}function Na(){return Pe().memoizedState}function Pr(e,n,t,r){var i=Re();V.flags|=e,i.memoizedState=Yt(1|n,t,void 0,r===void 0?null:r)}function ai(e,n,t,r){var i=Pe();r=r===void 0?null:r;var l=void 0;if(Y!==null){var o=Y.memoizedState;if(l=o.destroy,r!==null&&vo(r,o.deps)){i.memoizedState=Yt(n,t,l,r);return}}V.flags|=e,i.memoizedState=Yt(1|n,t,l,r)}function xu(e,n){return Pr(8390656,8,e,n)}function So(e,n){return ai(2048,8,e,n)}function Fa(e,n){return ai(4,2,e,n)}function Ma(e,n){return ai(4,4,e,n)}function Ra(e,n){if(typeof n=="function")return e=e(),n(e),function(){n(null)};if(n!=null)return e=e(),n.current=e,function(){n.current=null}}function Ba(e,n,t){return t=t!=null?t.concat([e]):null,ai(4,4,Ra.bind(null,n,e),t)}function _o(){}function Ia(e,n){var t=Pe();n=n===void 0?null:n;var r=t.memoizedState;return r!==null&&n!==null&&vo(n,r[1])?r[0]:(t.memoizedState=[e,n],e)}function Va(e,n){var t=Pe();n=n===void 0?null:n;var r=t.memoizedState;return r!==null&&n!==null&&vo(n,r[1])?r[0]:(e=e(),t.memoizedState=[e,n],e)}function Ha(e,n,t){return Tn&21?(Fe(t,n)||(t=Qs(),V.lanes|=t,Dn|=t,e.baseState=!0),n):(e.baseState&&(e.baseState=!1,de=!0),e.memoizedState=t)}function Od(e,n){var t=z;z=t!==0&&4>t?t:4,e(!0);var r=Ii.transition;Ii.transition={};try{e(!1),n()}finally{z=t,Ii.transition=r}}function Wa(){return Pe().memoizedState}function xd(e,n,t){var r=dn(e);if(t={lane:r,action:t,hasEagerState:!1,eagerState:null,next:null},Ua(e))qa(n,t);else if(t=$a(e,n,t,r),t!==null){var i=se();Ne(t,e,r,i),Ka(t,n,r)}}function $d(e,n,t){var r=dn(e),i={lane:r,action:t,hasEagerState:!1,eagerState:null,next:null};if(Ua(e))qa(n,i);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=n.lastRenderedReducer,l!==null))try{var o=n.lastRenderedState,u=l(o,t);if(i.hasEagerState=!0,i.eagerState=u,Fe(u,o)){var s=n.interleaved;s===null?(i.next=i,po(n)):(i.next=s.next,s.next=i),n.interleaved=i;return}}catch{}finally{}t=$a(e,n,i,r),t!==null&&(i=se(),Ne(t,e,r,i),Ka(t,n,r))}}function Ua(e){var n=e.alternate;return e===V||n!==null&&n===V}function qa(e,n){Ct=Xr=!0;var t=e.pending;t===null?n.next=n:(n.next=t.next,t.next=n),e.pending=n}function Ka(e,n,t){if(t&4194240){var r=n.lanes;r&=e.pendingLanes,t|=r,n.lanes=t,bl(e,t)}}var Gr={readContext:Ee,useCallback:re,useContext:re,useEffect:re,useImperativeHandle:re,useInsertionEffect:re,useLayoutEffect:re,useMemo:re,useReducer:re,useRef:re,useState:re,useDebugValue:re,useDeferredValue:re,useTransition:re,useMutableSource:re,useSyncExternalStore:re,useId:re,unstable_isNewReconciler:!1},Ed={readContext:Ee,useCallback:function(e,n){return Re().memoizedState=[e,n===void 0?null:n],e},useContext:Ee,useEffect:xu,useImperativeHandle:function(e,n,t){return t=t!=null?t.concat([e]):null,Pr(4194308,4,Ra.bind(null,n,e),t)},useLayoutEffect:function(e,n){return Pr(4194308,4,e,n)},useInsertionEffect:function(e,n){return Pr(4,2,e,n)},useMemo:function(e,n){var t=Re();return n=n===void 0?null:n,e=e(),t.memoizedState=[e,n],e},useReducer:function(e,n,t){var r=Re();return n=t!==void 0?t(n):n,r.memoizedState=r.baseState=n,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:n},r.queue=e,e=e.dispatch=xd.bind(null,V,e),[r.memoizedState,e]},useRef:function(e){var n=Re();return e={current:e},n.memoizedState=e},useState:Ou,useDebugValue:_o,useDeferredValue:function(e){return Re().memoizedState=e},useTransition:function(){var e=Ou(!1),n=e[0];return e=Od.bind(null,e[1]),Re().memoizedState=e,[n,e]},useMutableSource:function(){},useSyncExternalStore:function(e,n,t){var r=V,i=Re();if(B){if(t===void 0)throw Error(y(407));t=t()}else{if(t=n(),b===null)throw Error(y(349));Tn&30||Ta(r,n,t)}i.memoizedState=t;var l={value:t,getSnapshot:n};return i.queue=l,xu(Aa.bind(null,r,l,e),[e]),r.flags|=2048,Yt(9,Da.bind(null,r,l,t,n),void 0,null),t},useId:function(){var e=Re(),n=b.identifierPrefix;if(B){var t=qe,r=Ue;t=(r&~(1<<32-ze(r)-1)).toString(32)+t,n=":"+n+"R"+t,t=Kt++,0<t&&(n+="H"+t.toString(32)),n+=":"}else t=_d++,n=":"+n+"r"+t.toString(32)+":";return e.memoizedState=n},unstable_isNewReconciler:!1},Pd={readContext:Ee,useCallback:Ia,useContext:Ee,useEffect:So,useImperativeHandle:Ba,useInsertionEffect:Fa,useLayoutEffect:Ma,useMemo:Va,useReducer:Vi,useRef:Na,useState:function(){return Vi(Qt)},useDebugValue:_o,useDeferredValue:function(e){var n=Pe();return Ha(n,Y.memoizedState,e)},useTransition:function(){var e=Vi(Qt)[0],n=Pe().memoizedState;return[e,n]},useMutableSource:ja,useSyncExternalStore:Ca,useId:Wa,unstable_isNewReconciler:!1},jd={readContext:Ee,useCallback:Ia,useContext:Ee,useEffect:So,useImperativeHandle:Ba,useInsertionEffect:Fa,useLayoutEffect:Ma,useMemo:Va,useReducer:Hi,useRef:Na,useState:function(){return Hi(Qt)},useDebugValue:_o,useDeferredValue:function(e){var n=Pe();return Y===null?n.memoizedState=e:Ha(n,Y.memoizedState,e)},useTransition:function(){var e=Hi(Qt)[0],n=Pe().memoizedState;return[e,n]},useMutableSource:ja,useSyncExternalStore:Ca,useId:Wa,unstable_isNewReconciler:!1};function Te(e,n){if(e&&e.defaultProps){n=H({},n),e=e.defaultProps;for(var t in e)n[t]===void 0&&(n[t]=e[t]);return n}return n}function xl(e,n,t,r){n=e.memoizedState,t=t(r,n),t=t==null?n:H({},n,t),e.memoizedState=t,e.lanes===0&&(e.updateQueue.baseState=t)}var ci={isMounted:function(e){return(e=e._reactInternals)?zn(e)===e:!1},enqueueSetState:function(e,n,t){e=e._reactInternals;var r=se(),i=dn(e),l=Ke(r,i);l.payload=n,t!=null&&(l.callback=t),n=cn(e,l,i),n!==null&&(Ne(n,e,i,r),$r(n,e,i))},enqueueReplaceState:function(e,n,t){e=e._reactInternals;var r=se(),i=dn(e),l=Ke(r,i);l.tag=1,l.payload=n,t!=null&&(l.callback=t),n=cn(e,l,i),n!==null&&(Ne(n,e,i,r),$r(n,e,i))},enqueueForceUpdate:function(e,n){e=e._reactInternals;var t=se(),r=dn(e),i=Ke(t,r);i.tag=2,n!=null&&(i.callback=n),n=cn(e,i,r),n!==null&&(Ne(n,e,r,t),$r(n,e,r))}};function $u(e,n,t,r,i,l,o){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,l,o):n.prototype&&n.prototype.isPureReactComponent?!It(t,r)||!It(i,l):!0}function Qa(e,n,t){var r=!1,i=hn,l=n.contextType;return typeof l=="object"&&l!==null?l=Ee(l):(i=me(n)?jn:oe.current,r=n.contextTypes,l=(r=r!=null)?nt(e,i):hn),n=new n(t,l),e.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=ci,e.stateNode=n,n._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=i,e.__reactInternalMemoizedMaskedChildContext=l),n}function Eu(e,n,t,r){e=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(t,r),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(t,r),n.state!==e&&ci.enqueueReplaceState(n,n.state,null)}function $l(e,n,t,r){var i=e.stateNode;i.props=t,i.state=e.memoizedState,i.refs={},mo(e);var l=n.contextType;typeof l=="object"&&l!==null?i.context=Ee(l):(l=me(n)?jn:oe.current,i.context=nt(e,l)),i.state=e.memoizedState,l=n.getDerivedStateFromProps,typeof l=="function"&&(xl(e,n,l,t),i.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(n=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),n!==i.state&&ci.enqueueReplaceState(i,i.state,null),Qr(e,t,i,r),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308)}function lt(e,n){try{var t="",r=n;do t+=nf(r),r=r.return;while(r);var i=t}catch(l){i=`
Error generating stack: `+l.message+`
`+l.stack}return{value:e,source:n,stack:i,digest:null}}function Wi(e,n,t){return{value:e,source:null,stack:t??null,digest:n??null}}function El(e,n){try{console.error(n.value)}catch(t){setTimeout(function(){throw t})}}var Cd=typeof WeakMap=="function"?WeakMap:Map;function Ya(e,n,t){t=Ke(-1,t),t.tag=3,t.payload={element:null};var r=n.value;return t.callback=function(){br||(br=!0,Fl=r),El(e,n)},t}function Xa(e,n,t){t=Ke(-1,t),t.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var i=n.value;t.payload=function(){return r(i)},t.callback=function(){El(e,n)}}var l=e.stateNode;return l!==null&&typeof l.componentDidCatch=="function"&&(t.callback=function(){El(e,n),typeof r!="function"&&(fn===null?fn=new Set([this]):fn.add(this));var o=n.stack;this.componentDidCatch(n.value,{componentStack:o!==null?o:""})}),t}function Pu(e,n,t){var r=e.pingCache;if(r===null){r=e.pingCache=new Cd;var i=new Set;r.set(n,i)}else i=r.get(n),i===void 0&&(i=new Set,r.set(n,i));i.has(t)||(i.add(t),e=Wd.bind(null,e,n,t),n.then(e,e))}function ju(e){do{var n;if((n=e.tag===13)&&(n=e.memoizedState,n=n!==null?n.dehydrated!==null:!0),n)return e;e=e.return}while(e!==null);return null}function Cu(e,n,t,r,i){return e.mode&1?(e.flags|=65536,e.lanes=i,e):(e===n?e.flags|=65536:(e.flags|=128,t.flags|=131072,t.flags&=-52805,t.tag===1&&(t.alternate===null?t.tag=17:(n=Ke(-1,1),n.tag=2,cn(t,n,1))),t.lanes|=1),e)}var Td=Je.ReactCurrentOwner,de=!1;function ue(e,n,t,r){n.child=e===null?xa(n,null,t,r):rt(n,e.child,t,r)}function Tu(e,n,t,r,i){t=t.render;var l=n.ref;return bn(n,i),r=wo(e,n,t,r,l,i),t=ko(),e!==null&&!de?(n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~i,Ge(e,n,i)):(B&&t&&oo(n),n.flags|=1,ue(e,n,r,i),n.child)}function Du(e,n,t,r,i){if(e===null){var l=t.type;return typeof l=="function"&&!To(l)&&l.defaultProps===void 0&&t.compare===null&&t.defaultProps===void 0?(n.tag=15,n.type=l,Ga(e,n,l,r,i)):(e=Dr(t.type,null,r,n,n.mode,i),e.ref=n.ref,e.return=n,n.child=e)}if(l=e.child,!(e.lanes&i)){var o=l.memoizedProps;if(t=t.compare,t=t!==null?t:It,t(o,r)&&e.ref===n.ref)return Ge(e,n,i)}return n.flags|=1,e=pn(l,r),e.ref=n.ref,e.return=n,n.child=e}function Ga(e,n,t,r,i){if(e!==null){var l=e.memoizedProps;if(It(l,r)&&e.ref===n.ref)if(de=!1,n.pendingProps=r=l,(e.lanes&i)!==0)e.flags&131072&&(de=!0);else return n.lanes=e.lanes,Ge(e,n,i)}return Pl(e,n,t,r,i)}function Ja(e,n,t){var r=n.pendingProps,i=r.children,l=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(n.mode&1))n.memoizedState={baseLanes:0,cachePool:null,transitions:null},N(Qn,ge),ge|=t;else{if(!(t&1073741824))return e=l!==null?l.baseLanes|t:t,n.lanes=n.childLanes=1073741824,n.memoizedState={baseLanes:e,cachePool:null,transitions:null},n.updateQueue=null,N(Qn,ge),ge|=e,null;n.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=l!==null?l.baseLanes:t,N(Qn,ge),ge|=r}else l!==null?(r=l.baseLanes|t,n.memoizedState=null):r=t,N(Qn,ge),ge|=r;return ue(e,n,i,t),n.child}function ba(e,n){var t=n.ref;(e===null&&t!==null||e!==null&&e.ref!==t)&&(n.flags|=512,n.flags|=2097152)}function Pl(e,n,t,r,i){var l=me(t)?jn:oe.current;return l=nt(n,l),bn(n,i),t=wo(e,n,t,r,l,i),r=ko(),e!==null&&!de?(n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~i,Ge(e,n,i)):(B&&r&&oo(n),n.flags|=1,ue(e,n,t,i),n.child)}function Au(e,n,t,r,i){if(me(t)){var l=!0;Hr(n)}else l=!1;if(bn(n,i),n.stateNode===null)jr(e,n),Qa(n,t,r),$l(n,t,r,i),r=!0;else if(e===null){var o=n.stateNode,u=n.memoizedProps;o.props=u;var s=o.context,c=t.contextType;typeof c=="object"&&c!==null?c=Ee(c):(c=me(t)?jn:oe.current,c=nt(n,c));var h=t.getDerivedStateFromProps,p=typeof h=="function"||typeof o.getSnapshotBeforeUpdate=="function";p||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(u!==r||s!==c)&&Eu(n,o,r,c),en=!1;var m=n.memoizedState;o.state=m,Qr(n,r,o,i),s=n.memoizedState,u!==r||m!==s||pe.current||en?(typeof h=="function"&&(xl(n,t,h,r),s=n.memoizedState),(u=en||$u(n,t,u,r,m,s,c))?(p||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(n.flags|=4194308)):(typeof o.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=r,n.memoizedState=s),o.props=r,o.state=s,o.context=c,r=u):(typeof o.componentDidMount=="function"&&(n.flags|=4194308),r=!1)}else{o=n.stateNode,Ea(e,n),u=n.memoizedProps,c=n.type===n.elementType?u:Te(n.type,u),o.props=c,p=n.pendingProps,m=o.context,s=t.contextType,typeof s=="object"&&s!==null?s=Ee(s):(s=me(t)?jn:oe.current,s=nt(n,s));var v=t.getDerivedStateFromProps;(h=typeof v=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(u!==p||m!==s)&&Eu(n,o,r,s),en=!1,m=n.memoizedState,o.state=m,Qr(n,r,o,i);var w=n.memoizedState;u!==p||m!==w||pe.current||en?(typeof v=="function"&&(xl(n,t,v,r),w=n.memoizedState),(c=en||$u(n,t,c,r,m,w,s)||!1)?(h||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,w,s),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,w,s)),typeof o.componentDidUpdate=="function"&&(n.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof o.componentDidUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(n.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(n.flags|=1024),n.memoizedProps=r,n.memoizedState=w),o.props=r,o.state=w,o.context=s,r=c):(typeof o.componentDidUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(n.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(n.flags|=1024),r=!1)}return jl(e,n,t,r,l,i)}function jl(e,n,t,r,i,l){ba(e,n);var o=(n.flags&128)!==0;if(!r&&!o)return i&&yu(n,t,!1),Ge(e,n,l);r=n.stateNode,Td.current=n;var u=o&&typeof t.getDerivedStateFromError!="function"?null:r.render();return n.flags|=1,e!==null&&o?(n.child=rt(n,e.child,null,l),n.child=rt(n,null,u,l)):ue(e,n,u,l),n.memoizedState=r.state,i&&yu(n,t,!0),n.child}function Za(e){var n=e.stateNode;n.pendingContext?gu(e,n.pendingContext,n.pendingContext!==n.context):n.context&&gu(e,n.context,!1),ho(e,n.containerInfo)}function Lu(e,n,t,r,i){return tt(),so(i),n.flags|=256,ue(e,n,t,r),n.child}var Cl={dehydrated:null,treeContext:null,retryLane:0};function Tl(e){return{baseLanes:e,cachePool:null,transitions:null}}function ec(e,n,t){var r=n.pendingProps,i=I.current,l=!1,o=(n.flags&128)!==0,u;if((u=o)||(u=e!==null&&e.memoizedState===null?!1:(i&2)!==0),u?(l=!0,n.flags&=-129):(e===null||e.memoizedState!==null)&&(i|=1),N(I,i&1),e===null)return _l(n),e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(n.mode&1?e.data==="$!"?n.lanes=8:n.lanes=1073741824:n.lanes=1,null):(o=r.children,e=r.fallback,l?(r=n.mode,l=n.child,o={mode:"hidden",children:o},!(r&1)&&l!==null?(l.childLanes=0,l.pendingProps=o):l=pi(o,r,0,null),e=Pn(e,r,t,null),l.return=n,e.return=n,l.sibling=e,n.child=l,n.child.memoizedState=Tl(t),n.memoizedState=Cl,e):Oo(n,o));if(i=e.memoizedState,i!==null&&(u=i.dehydrated,u!==null))return Dd(e,n,o,r,u,i,t);if(l){l=r.fallback,o=n.mode,i=e.child,u=i.sibling;var s={mode:"hidden",children:r.children};return!(o&1)&&n.child!==i?(r=n.child,r.childLanes=0,r.pendingProps=s,n.deletions=null):(r=pn(i,s),r.subtreeFlags=i.subtreeFlags&14680064),u!==null?l=pn(u,l):(l=Pn(l,o,t,null),l.flags|=2),l.return=n,r.return=n,r.sibling=l,n.child=r,r=l,l=n.child,o=e.child.memoizedState,o=o===null?Tl(t):{baseLanes:o.baseLanes|t,cachePool:null,transitions:o.transitions},l.memoizedState=o,l.childLanes=e.childLanes&~t,n.memoizedState=Cl,r}return l=e.child,e=l.sibling,r=pn(l,{mode:"visible",children:r.children}),!(n.mode&1)&&(r.lanes=t),r.return=n,r.sibling=null,e!==null&&(t=n.deletions,t===null?(n.deletions=[e],n.flags|=16):t.push(e)),n.child=r,n.memoizedState=null,r}function Oo(e,n){return n=pi({mode:"visible",children:n},e.mode,0,null),n.return=e,e.child=n}function gr(e,n,t,r){return r!==null&&so(r),rt(n,e.child,null,t),e=Oo(n,n.pendingProps.children),e.flags|=2,n.memoizedState=null,e}function Dd(e,n,t,r,i,l,o){if(t)return n.flags&256?(n.flags&=-257,r=Wi(Error(y(422))),gr(e,n,o,r)):n.memoizedState!==null?(n.child=e.child,n.flags|=128,null):(l=r.fallback,i=n.mode,r=pi({mode:"visible",children:r.children},i,0,null),l=Pn(l,i,o,null),l.flags|=2,r.return=n,l.return=n,r.sibling=l,n.child=r,n.mode&1&&rt(n,e.child,null,o),n.child.memoizedState=Tl(o),n.memoizedState=Cl,l);if(!(n.mode&1))return gr(e,n,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var u=r.dgst;return r=u,l=Error(y(419)),r=Wi(l,r,void 0),gr(e,n,o,r)}if(u=(o&e.childLanes)!==0,de||u){if(r=b,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==l.retryLane&&(l.retryLane=i,Xe(e,i),Ne(r,e,i,-1))}return Co(),r=Wi(Error(y(421))),gr(e,n,o,r)}return i.data==="$?"?(n.flags|=128,n.child=e.child,n=Ud.bind(null,e),i._reactRetry=n,null):(e=l.treeContext,ye=an(i.nextSibling),ve=n,B=!0,Ae=null,e!==null&&(_e[Oe++]=Ue,_e[Oe++]=qe,_e[Oe++]=Cn,Ue=e.id,qe=e.overflow,Cn=n),n=Oo(n,r.children),n.flags|=4096,n)}function zu(e,n,t){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n),Ol(e.return,n,t)}function Ui(e,n,t,r,i){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:r,tail:t,tailMode:i}:(l.isBackwards=n,l.rendering=null,l.renderingStartTime=0,l.last=r,l.tail=t,l.tailMode=i)}function nc(e,n,t){var r=n.pendingProps,i=r.revealOrder,l=r.tail;if(ue(e,n,r.children,t),r=I.current,r&2)r=r&1|2,n.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=n.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&zu(e,t,n);else if(e.tag===19)zu(e,t,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break e;for(;e.sibling===null;){if(e.return===null||e.return===n)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(N(I,r),!(n.mode&1))n.memoizedState=null;else switch(i){case"forwards":for(t=n.child,i=null;t!==null;)e=t.alternate,e!==null&&Yr(e)===null&&(i=t),t=t.sibling;t=i,t===null?(i=n.child,n.child=null):(i=t.sibling,t.sibling=null),Ui(n,!1,i,t,l);break;case"backwards":for(t=null,i=n.child,n.child=null;i!==null;){if(e=i.alternate,e!==null&&Yr(e)===null){n.child=i;break}e=i.sibling,i.sibling=t,t=i,i=e}Ui(n,!0,t,null,l);break;case"together":Ui(n,!1,null,null,void 0);break;default:n.memoizedState=null}return n.child}function jr(e,n){!(n.mode&1)&&e!==null&&(e.alternate=null,n.alternate=null,n.flags|=2)}function Ge(e,n,t){if(e!==null&&(n.dependencies=e.dependencies),Dn|=n.lanes,!(t&n.childLanes))return null;if(e!==null&&n.child!==e.child)throw Error(y(153));if(n.child!==null){for(e=n.child,t=pn(e,e.pendingProps),n.child=t,t.return=n;e.sibling!==null;)e=e.sibling,t=t.sibling=pn(e,e.pendingProps),t.return=n;t.sibling=null}return n.child}function Ad(e,n,t){switch(n.tag){case 3:Za(n),tt();break;case 5:Pa(n);break;case 1:me(n.type)&&Hr(n);break;case 4:ho(n,n.stateNode.containerInfo);break;case 10:var r=n.type._context,i=n.memoizedProps.value;N(qr,r._currentValue),r._currentValue=i;break;case 13:if(r=n.memoizedState,r!==null)return r.dehydrated!==null?(N(I,I.current&1),n.flags|=128,null):t&n.child.childLanes?ec(e,n,t):(N(I,I.current&1),e=Ge(e,n,t),e!==null?e.sibling:null);N(I,I.current&1);break;case 19:if(r=(t&n.childLanes)!==0,e.flags&128){if(r)return nc(e,n,t);n.flags|=128}if(i=n.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),N(I,I.current),r)break;return null;case 22:case 23:return n.lanes=0,Ja(e,n,t)}return Ge(e,n,t)}var tc,Dl,rc,ic;tc=function(e,n){for(var t=n.child;t!==null;){if(t.tag===5||t.tag===6)e.appendChild(t.stateNode);else if(t.tag!==4&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break;for(;t.sibling===null;){if(t.return===null||t.return===n)return;t=t.return}t.sibling.return=t.return,t=t.sibling}};Dl=function(){};rc=function(e,n,t,r){var i=e.memoizedProps;if(i!==r){e=n.stateNode,$n(Ve.current);var l=null;switch(t){case"input":i=Zi(e,i),r=Zi(e,r),l=[];break;case"select":i=H({},i,{value:void 0}),r=H({},r,{value:void 0}),l=[];break;case"textarea":i=tl(e,i),r=tl(e,r),l=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=Ir)}il(t,r);var o;t=null;for(c in i)if(!r.hasOwnProperty(c)&&i.hasOwnProperty(c)&&i[c]!=null)if(c==="style"){var u=i[c];for(o in u)u.hasOwnProperty(o)&&(t||(t={}),t[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(Lt.hasOwnProperty(c)?l||(l=[]):(l=l||[]).push(c,null));for(c in r){var s=r[c];if(u=i!=null?i[c]:void 0,r.hasOwnProperty(c)&&s!==u&&(s!=null||u!=null))if(c==="style")if(u){for(o in u)!u.hasOwnProperty(o)||s&&s.hasOwnProperty(o)||(t||(t={}),t[o]="");for(o in s)s.hasOwnProperty(o)&&u[o]!==s[o]&&(t||(t={}),t[o]=s[o])}else t||(l||(l=[]),l.push(c,t)),t=s;else c==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,u=u?u.__html:void 0,s!=null&&u!==s&&(l=l||[]).push(c,s)):c==="children"?typeof s!="string"&&typeof s!="number"||(l=l||[]).push(c,""+s):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(Lt.hasOwnProperty(c)?(s!=null&&c==="onScroll"&&F("scroll",e),l||u===s||(l=[])):(l=l||[]).push(c,s))}t&&(l=l||[]).push("style",t);var c=l;(n.updateQueue=c)&&(n.flags|=4)}};ic=function(e,n,t,r){t!==r&&(n.flags|=4)};function vt(e,n){if(!B)switch(e.tailMode){case"hidden":n=e.tail;for(var t=null;n!==null;)n.alternate!==null&&(t=n),n=n.sibling;t===null?e.tail=null:t.sibling=null;break;case"collapsed":t=e.tail;for(var r=null;t!==null;)t.alternate!==null&&(r=t),t=t.sibling;r===null?n||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function ie(e){var n=e.alternate!==null&&e.alternate.child===e.child,t=0,r=0;if(n)for(var i=e.child;i!==null;)t|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)t|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=t,n}function Ld(e,n,t){var r=n.pendingProps;switch(uo(n),n.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ie(n),null;case 1:return me(n.type)&&Vr(),ie(n),null;case 3:return r=n.stateNode,it(),M(pe),M(oe),yo(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(mr(n)?n.flags|=4:e===null||e.memoizedState.isDehydrated&&!(n.flags&256)||(n.flags|=1024,Ae!==null&&(Bl(Ae),Ae=null))),Dl(e,n),ie(n),null;case 5:go(n);var i=$n(qt.current);if(t=n.type,e!==null&&n.stateNode!=null)rc(e,n,t,r,i),e.ref!==n.ref&&(n.flags|=512,n.flags|=2097152);else{if(!r){if(n.stateNode===null)throw Error(y(166));return ie(n),null}if(e=$n(Ve.current),mr(n)){r=n.stateNode,t=n.type;var l=n.memoizedProps;switch(r[Be]=n,r[Wt]=l,e=(n.mode&1)!==0,t){case"dialog":F("cancel",r),F("close",r);break;case"iframe":case"object":case"embed":F("load",r);break;case"video":case"audio":for(i=0;i<Ot.length;i++)F(Ot[i],r);break;case"source":F("error",r);break;case"img":case"image":case"link":F("error",r),F("load",r);break;case"details":F("toggle",r);break;case"input":Wo(r,l),F("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!l.multiple},F("invalid",r);break;case"textarea":qo(r,l),F("invalid",r)}il(t,l),i=null;for(var o in l)if(l.hasOwnProperty(o)){var u=l[o];o==="children"?typeof u=="string"?r.textContent!==u&&(l.suppressHydrationWarning!==!0&&pr(r.textContent,u,e),i=["children",u]):typeof u=="number"&&r.textContent!==""+u&&(l.suppressHydrationWarning!==!0&&pr(r.textContent,u,e),i=["children",""+u]):Lt.hasOwnProperty(o)&&u!=null&&o==="onScroll"&&F("scroll",r)}switch(t){case"input":lr(r),Uo(r,l,!0);break;case"textarea":lr(r),Ko(r);break;case"select":case"option":break;default:typeof l.onClick=="function"&&(r.onclick=Ir)}r=i,n.updateQueue=r,r!==null&&(n.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=As(t)),e==="http://www.w3.org/1999/xhtml"?t==="script"?(e=o.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=o.createElement(t,{is:r.is}):(e=o.createElement(t),t==="select"&&(o=e,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):e=o.createElementNS(e,t),e[Be]=n,e[Wt]=r,tc(e,n,!1,!1),n.stateNode=e;e:{switch(o=ll(t,r),t){case"dialog":F("cancel",e),F("close",e),i=r;break;case"iframe":case"object":case"embed":F("load",e),i=r;break;case"video":case"audio":for(i=0;i<Ot.length;i++)F(Ot[i],e);i=r;break;case"source":F("error",e),i=r;break;case"img":case"image":case"link":F("error",e),F("load",e),i=r;break;case"details":F("toggle",e),i=r;break;case"input":Wo(e,r),i=Zi(e,r),F("invalid",e);break;case"option":i=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},i=H({},r,{value:void 0}),F("invalid",e);break;case"textarea":qo(e,r),i=tl(e,r),F("invalid",e);break;default:i=r}il(t,i),u=i;for(l in u)if(u.hasOwnProperty(l)){var s=u[l];l==="style"?Ns(e,s):l==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,s!=null&&Ls(e,s)):l==="children"?typeof s=="string"?(t!=="textarea"||s!=="")&&zt(e,s):typeof s=="number"&&zt(e,""+s):l!=="suppressContentEditableWarning"&&l!=="suppressHydrationWarning"&&l!=="autoFocus"&&(Lt.hasOwnProperty(l)?s!=null&&l==="onScroll"&&F("scroll",e):s!=null&&Kl(e,l,s,o))}switch(t){case"input":lr(e),Uo(e,r,!1);break;case"textarea":lr(e),Ko(e);break;case"option":r.value!=null&&e.setAttribute("value",""+mn(r.value));break;case"select":e.multiple=!!r.multiple,l=r.value,l!=null?Yn(e,!!r.multiple,l,!1):r.defaultValue!=null&&Yn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(e.onclick=Ir)}switch(t){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(n.flags|=4)}n.ref!==null&&(n.flags|=512,n.flags|=2097152)}return ie(n),null;case 6:if(e&&n.stateNode!=null)ic(e,n,e.memoizedProps,r);else{if(typeof r!="string"&&n.stateNode===null)throw Error(y(166));if(t=$n(qt.current),$n(Ve.current),mr(n)){if(r=n.stateNode,t=n.memoizedProps,r[Be]=n,(l=r.nodeValue!==t)&&(e=ve,e!==null))switch(e.tag){case 3:pr(r.nodeValue,t,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&pr(r.nodeValue,t,(e.mode&1)!==0)}l&&(n.flags|=4)}else r=(t.nodeType===9?t:t.ownerDocument).createTextNode(r),r[Be]=n,n.stateNode=r}return ie(n),null;case 13:if(M(I),r=n.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(B&&ye!==null&&n.mode&1&&!(n.flags&128))_a(),tt(),n.flags|=98560,l=!1;else if(l=mr(n),r!==null&&r.dehydrated!==null){if(e===null){if(!l)throw Error(y(318));if(l=n.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(y(317));l[Be]=n}else tt(),!(n.flags&128)&&(n.memoizedState=null),n.flags|=4;ie(n),l=!1}else Ae!==null&&(Bl(Ae),Ae=null),l=!0;if(!l)return n.flags&65536?n:null}return n.flags&128?(n.lanes=t,n):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(n.child.flags|=8192,n.mode&1&&(e===null||I.current&1?X===0&&(X=3):Co())),n.updateQueue!==null&&(n.flags|=4),ie(n),null);case 4:return it(),Dl(e,n),e===null&&Vt(n.stateNode.containerInfo),ie(n),null;case 10:return fo(n.type._context),ie(n),null;case 17:return me(n.type)&&Vr(),ie(n),null;case 19:if(M(I),l=n.memoizedState,l===null)return ie(n),null;if(r=(n.flags&128)!==0,o=l.rendering,o===null)if(r)vt(l,!1);else{if(X!==0||e!==null&&e.flags&128)for(e=n.child;e!==null;){if(o=Yr(e),o!==null){for(n.flags|=128,vt(l,!1),r=o.updateQueue,r!==null&&(n.updateQueue=r,n.flags|=4),n.subtreeFlags=0,r=t,t=n.child;t!==null;)l=t,e=r,l.flags&=14680066,o=l.alternate,o===null?(l.childLanes=0,l.lanes=e,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=o.childLanes,l.lanes=o.lanes,l.child=o.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=o.memoizedProps,l.memoizedState=o.memoizedState,l.updateQueue=o.updateQueue,l.type=o.type,e=o.dependencies,l.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t=t.sibling;return N(I,I.current&1|2),n.child}e=e.sibling}l.tail!==null&&K()>ot&&(n.flags|=128,r=!0,vt(l,!1),n.lanes=4194304)}else{if(!r)if(e=Yr(o),e!==null){if(n.flags|=128,r=!0,t=e.updateQueue,t!==null&&(n.updateQueue=t,n.flags|=4),vt(l,!0),l.tail===null&&l.tailMode==="hidden"&&!o.alternate&&!B)return ie(n),null}else 2*K()-l.renderingStartTime>ot&&t!==1073741824&&(n.flags|=128,r=!0,vt(l,!1),n.lanes=4194304);l.isBackwards?(o.sibling=n.child,n.child=o):(t=l.last,t!==null?t.sibling=o:n.child=o,l.last=o)}return l.tail!==null?(n=l.tail,l.rendering=n,l.tail=n.sibling,l.renderingStartTime=K(),n.sibling=null,t=I.current,N(I,r?t&1|2:t&1),n):(ie(n),null);case 22:case 23:return jo(),r=n.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(n.flags|=8192),r&&n.mode&1?ge&1073741824&&(ie(n),n.subtreeFlags&6&&(n.flags|=8192)):ie(n),null;case 24:return null;case 25:return null}throw Error(y(156,n.tag))}function zd(e,n){switch(uo(n),n.tag){case 1:return me(n.type)&&Vr(),e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 3:return it(),M(pe),M(oe),yo(),e=n.flags,e&65536&&!(e&128)?(n.flags=e&-65537|128,n):null;case 5:return go(n),null;case 13:if(M(I),e=n.memoizedState,e!==null&&e.dehydrated!==null){if(n.alternate===null)throw Error(y(340));tt()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 19:return M(I),null;case 4:return it(),null;case 10:return fo(n.type._context),null;case 22:case 23:return jo(),null;case 24:return null;default:return null}}var yr=!1,le=!1,Nd=typeof WeakSet=="function"?WeakSet:Set,S=null;function Kn(e,n){var t=e.ref;if(t!==null)if(typeof t=="function")try{t(null)}catch(r){W(e,n,r)}else t.current=null}function Al(e,n,t){try{t()}catch(r){W(e,n,r)}}var Nu=!1;function Fd(e,n){if(hl=Mr,e=aa(),lo(e)){if("selectionStart"in e)var t={start:e.selectionStart,end:e.selectionEnd};else e:{t=(t=e.ownerDocument)&&t.defaultView||window;var r=t.getSelection&&t.getSelection();if(r&&r.rangeCount!==0){t=r.anchorNode;var i=r.anchorOffset,l=r.focusNode;r=r.focusOffset;try{t.nodeType,l.nodeType}catch{t=null;break e}var o=0,u=-1,s=-1,c=0,h=0,p=e,m=null;n:for(;;){for(var v;p!==t||i!==0&&p.nodeType!==3||(u=o+i),p!==l||r!==0&&p.nodeType!==3||(s=o+r),p.nodeType===3&&(o+=p.nodeValue.length),(v=p.firstChild)!==null;)m=p,p=v;for(;;){if(p===e)break n;if(m===t&&++c===i&&(u=o),m===l&&++h===r&&(s=o),(v=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=v}t=u===-1||s===-1?null:{start:u,end:s}}else t=null}t=t||{start:0,end:0}}else t=null;for(gl={focusedElem:e,selectionRange:t},Mr=!1,S=n;S!==null;)if(n=S,e=n.child,(n.subtreeFlags&1028)!==0&&e!==null)e.return=n,S=e;else for(;S!==null;){n=S;try{var w=n.alternate;if(n.flags&1024)switch(n.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var k=w.memoizedProps,R=w.memoizedState,f=n.stateNode,a=f.getSnapshotBeforeUpdate(n.elementType===n.type?k:Te(n.type,k),R);f.__reactInternalSnapshotBeforeUpdate=a}break;case 3:var d=n.stateNode.containerInfo;d.nodeType===1?d.textContent="":d.nodeType===9&&d.documentElement&&d.removeChild(d.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(y(163))}}catch(g){W(n,n.return,g)}if(e=n.sibling,e!==null){e.return=n.return,S=e;break}S=n.return}return w=Nu,Nu=!1,w}function Tt(e,n,t){var r=n.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&e)===e){var l=i.destroy;i.destroy=void 0,l!==void 0&&Al(n,t,l)}i=i.next}while(i!==r)}}function fi(e,n){if(n=n.updateQueue,n=n!==null?n.lastEffect:null,n!==null){var t=n=n.next;do{if((t.tag&e)===e){var r=t.create;t.destroy=r()}t=t.next}while(t!==n)}}function Ll(e){var n=e.ref;if(n!==null){var t=e.stateNode;switch(e.tag){case 5:e=t;break;default:e=t}typeof n=="function"?n(e):n.current=e}}function lc(e){var n=e.alternate;n!==null&&(e.alternate=null,lc(n)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(n=e.stateNode,n!==null&&(delete n[Be],delete n[Wt],delete n[wl],delete n[vd],delete n[wd])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function oc(e){return e.tag===5||e.tag===3||e.tag===4}function Fu(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||oc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function zl(e,n,t){var r=e.tag;if(r===5||r===6)e=e.stateNode,n?t.nodeType===8?t.parentNode.insertBefore(e,n):t.insertBefore(e,n):(t.nodeType===8?(n=t.parentNode,n.insertBefore(e,t)):(n=t,n.appendChild(e)),t=t._reactRootContainer,t!=null||n.onclick!==null||(n.onclick=Ir));else if(r!==4&&(e=e.child,e!==null))for(zl(e,n,t),e=e.sibling;e!==null;)zl(e,n,t),e=e.sibling}function Nl(e,n,t){var r=e.tag;if(r===5||r===6)e=e.stateNode,n?t.insertBefore(e,n):t.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Nl(e,n,t),e=e.sibling;e!==null;)Nl(e,n,t),e=e.sibling}var Z=null,De=!1;function be(e,n,t){for(t=t.child;t!==null;)uc(e,n,t),t=t.sibling}function uc(e,n,t){if(Ie&&typeof Ie.onCommitFiberUnmount=="function")try{Ie.onCommitFiberUnmount(ri,t)}catch{}switch(t.tag){case 5:le||Kn(t,n);case 6:var r=Z,i=De;Z=null,be(e,n,t),Z=r,De=i,Z!==null&&(De?(e=Z,t=t.stateNode,e.nodeType===8?e.parentNode.removeChild(t):e.removeChild(t)):Z.removeChild(t.stateNode));break;case 18:Z!==null&&(De?(e=Z,t=t.stateNode,e.nodeType===8?Mi(e.parentNode,t):e.nodeType===1&&Mi(e,t),Rt(e)):Mi(Z,t.stateNode));break;case 4:r=Z,i=De,Z=t.stateNode.containerInfo,De=!0,be(e,n,t),Z=r,De=i;break;case 0:case 11:case 14:case 15:if(!le&&(r=t.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var l=i,o=l.destroy;l=l.tag,o!==void 0&&(l&2||l&4)&&Al(t,n,o),i=i.next}while(i!==r)}be(e,n,t);break;case 1:if(!le&&(Kn(t,n),r=t.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=t.memoizedProps,r.state=t.memoizedState,r.componentWillUnmount()}catch(u){W(t,n,u)}be(e,n,t);break;case 21:be(e,n,t);break;case 22:t.mode&1?(le=(r=le)||t.memoizedState!==null,be(e,n,t),le=r):be(e,n,t);break;default:be(e,n,t)}}function Mu(e){var n=e.updateQueue;if(n!==null){e.updateQueue=null;var t=e.stateNode;t===null&&(t=e.stateNode=new Nd),n.forEach(function(r){var i=qd.bind(null,e,r);t.has(r)||(t.add(r),r.then(i,i))})}}function Ce(e,n){var t=n.deletions;if(t!==null)for(var r=0;r<t.length;r++){var i=t[r];try{var l=e,o=n,u=o;e:for(;u!==null;){switch(u.tag){case 5:Z=u.stateNode,De=!1;break e;case 3:Z=u.stateNode.containerInfo,De=!0;break e;case 4:Z=u.stateNode.containerInfo,De=!0;break e}u=u.return}if(Z===null)throw Error(y(160));uc(l,o,i),Z=null,De=!1;var s=i.alternate;s!==null&&(s.return=null),i.return=null}catch(c){W(i,n,c)}}if(n.subtreeFlags&12854)for(n=n.child;n!==null;)sc(n,e),n=n.sibling}function sc(e,n){var t=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Ce(n,e),Me(e),r&4){try{Tt(3,e,e.return),fi(3,e)}catch(k){W(e,e.return,k)}try{Tt(5,e,e.return)}catch(k){W(e,e.return,k)}}break;case 1:Ce(n,e),Me(e),r&512&&t!==null&&Kn(t,t.return);break;case 5:if(Ce(n,e),Me(e),r&512&&t!==null&&Kn(t,t.return),e.flags&32){var i=e.stateNode;try{zt(i,"")}catch(k){W(e,e.return,k)}}if(r&4&&(i=e.stateNode,i!=null)){var l=e.memoizedProps,o=t!==null?t.memoizedProps:l,u=e.type,s=e.updateQueue;if(e.updateQueue=null,s!==null)try{u==="input"&&l.type==="radio"&&l.name!=null&&Ts(i,l),ll(u,o);var c=ll(u,l);for(o=0;o<s.length;o+=2){var h=s[o],p=s[o+1];h==="style"?Ns(i,p):h==="dangerouslySetInnerHTML"?Ls(i,p):h==="children"?zt(i,p):Kl(i,h,p,c)}switch(u){case"input":el(i,l);break;case"textarea":Ds(i,l);break;case"select":var m=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!l.multiple;var v=l.value;v!=null?Yn(i,!!l.multiple,v,!1):m!==!!l.multiple&&(l.defaultValue!=null?Yn(i,!!l.multiple,l.defaultValue,!0):Yn(i,!!l.multiple,l.multiple?[]:"",!1))}i[Wt]=l}catch(k){W(e,e.return,k)}}break;case 6:if(Ce(n,e),Me(e),r&4){if(e.stateNode===null)throw Error(y(162));i=e.stateNode,l=e.memoizedProps;try{i.nodeValue=l}catch(k){W(e,e.return,k)}}break;case 3:if(Ce(n,e),Me(e),r&4&&t!==null&&t.memoizedState.isDehydrated)try{Rt(n.containerInfo)}catch(k){W(e,e.return,k)}break;case 4:Ce(n,e),Me(e);break;case 13:Ce(n,e),Me(e),i=e.child,i.flags&8192&&(l=i.memoizedState!==null,i.stateNode.isHidden=l,!l||i.alternate!==null&&i.alternate.memoizedState!==null||(Eo=K())),r&4&&Mu(e);break;case 22:if(h=t!==null&&t.memoizedState!==null,e.mode&1?(le=(c=le)||h,Ce(n,e),le=c):Ce(n,e),Me(e),r&8192){if(c=e.memoizedState!==null,(e.stateNode.isHidden=c)&&!h&&e.mode&1)for(S=e,h=e.child;h!==null;){for(p=S=h;S!==null;){switch(m=S,v=m.child,m.tag){case 0:case 11:case 14:case 15:Tt(4,m,m.return);break;case 1:Kn(m,m.return);var w=m.stateNode;if(typeof w.componentWillUnmount=="function"){r=m,t=m.return;try{n=r,w.props=n.memoizedProps,w.state=n.memoizedState,w.componentWillUnmount()}catch(k){W(r,t,k)}}break;case 5:Kn(m,m.return);break;case 22:if(m.memoizedState!==null){Bu(p);continue}}v!==null?(v.return=m,S=v):Bu(p)}h=h.sibling}e:for(h=null,p=e;;){if(p.tag===5){if(h===null){h=p;try{i=p.stateNode,c?(l=i.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"):(u=p.stateNode,s=p.memoizedProps.style,o=s!=null&&s.hasOwnProperty("display")?s.display:null,u.style.display=zs("display",o))}catch(k){W(e,e.return,k)}}}else if(p.tag===6){if(h===null)try{p.stateNode.nodeValue=c?"":p.memoizedProps}catch(k){W(e,e.return,k)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===e)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===e)break e;for(;p.sibling===null;){if(p.return===null||p.return===e)break e;h===p&&(h=null),p=p.return}h===p&&(h=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Ce(n,e),Me(e),r&4&&Mu(e);break;case 21:break;default:Ce(n,e),Me(e)}}function Me(e){var n=e.flags;if(n&2){try{e:{for(var t=e.return;t!==null;){if(oc(t)){var r=t;break e}t=t.return}throw Error(y(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(zt(i,""),r.flags&=-33);var l=Fu(e);Nl(e,l,i);break;case 3:case 4:var o=r.stateNode.containerInfo,u=Fu(e);zl(e,u,o);break;default:throw Error(y(161))}}catch(s){W(e,e.return,s)}e.flags&=-3}n&4096&&(e.flags&=-4097)}function Md(e,n,t){S=e,ac(e)}function ac(e,n,t){for(var r=(e.mode&1)!==0;S!==null;){var i=S,l=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||yr;if(!o){var u=i.alternate,s=u!==null&&u.memoizedState!==null||le;u=yr;var c=le;if(yr=o,(le=s)&&!c)for(S=i;S!==null;)o=S,s=o.child,o.tag===22&&o.memoizedState!==null?Iu(i):s!==null?(s.return=o,S=s):Iu(i);for(;l!==null;)S=l,ac(l),l=l.sibling;S=i,yr=u,le=c}Ru(e)}else i.subtreeFlags&8772&&l!==null?(l.return=i,S=l):Ru(e)}}function Ru(e){for(;S!==null;){var n=S;if(n.flags&8772){var t=n.alternate;try{if(n.flags&8772)switch(n.tag){case 0:case 11:case 15:le||fi(5,n);break;case 1:var r=n.stateNode;if(n.flags&4&&!le)if(t===null)r.componentDidMount();else{var i=n.elementType===n.type?t.memoizedProps:Te(n.type,t.memoizedProps);r.componentDidUpdate(i,t.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var l=n.updateQueue;l!==null&&_u(n,l,r);break;case 3:var o=n.updateQueue;if(o!==null){if(t=null,n.child!==null)switch(n.child.tag){case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}_u(n,o,t)}break;case 5:var u=n.stateNode;if(t===null&&n.flags&4){t=u;var s=n.memoizedProps;switch(n.type){case"button":case"input":case"select":case"textarea":s.autoFocus&&t.focus();break;case"img":s.src&&(t.src=s.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(n.memoizedState===null){var c=n.alternate;if(c!==null){var h=c.memoizedState;if(h!==null){var p=h.dehydrated;p!==null&&Rt(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(y(163))}le||n.flags&512&&Ll(n)}catch(m){W(n,n.return,m)}}if(n===e){S=null;break}if(t=n.sibling,t!==null){t.return=n.return,S=t;break}S=n.return}}function Bu(e){for(;S!==null;){var n=S;if(n===e){S=null;break}var t=n.sibling;if(t!==null){t.return=n.return,S=t;break}S=n.return}}function Iu(e){for(;S!==null;){var n=S;try{switch(n.tag){case 0:case 11:case 15:var t=n.return;try{fi(4,n)}catch(s){W(n,t,s)}break;case 1:var r=n.stateNode;if(typeof r.componentDidMount=="function"){var i=n.return;try{r.componentDidMount()}catch(s){W(n,i,s)}}var l=n.return;try{Ll(n)}catch(s){W(n,l,s)}break;case 5:var o=n.return;try{Ll(n)}catch(s){W(n,o,s)}}}catch(s){W(n,n.return,s)}if(n===e){S=null;break}var u=n.sibling;if(u!==null){u.return=n.return,S=u;break}S=n.return}}var Rd=Math.ceil,Jr=Je.ReactCurrentDispatcher,xo=Je.ReactCurrentOwner,$e=Je.ReactCurrentBatchConfig,L=0,b=null,Q=null,ee=0,ge=0,Qn=yn(0),X=0,Xt=null,Dn=0,di=0,$o=0,Dt=null,fe=null,Eo=0,ot=1/0,He=null,br=!1,Fl=null,fn=null,vr=!1,ln=null,Zr=0,At=0,Ml=null,Cr=-1,Tr=0;function se(){return L&6?K():Cr!==-1?Cr:Cr=K()}function dn(e){return e.mode&1?L&2&&ee!==0?ee&-ee:Sd.transition!==null?(Tr===0&&(Tr=Qs()),Tr):(e=z,e!==0||(e=window.event,e=e===void 0?16:ea(e.type)),e):1}function Ne(e,n,t,r){if(50<At)throw At=0,Ml=null,Error(y(185));Jt(e,t,r),(!(L&2)||e!==b)&&(e===b&&(!(L&2)&&(di|=t),X===4&&tn(e,ee)),he(e,r),t===1&&L===0&&!(n.mode&1)&&(ot=K()+500,si&&vn()))}function he(e,n){var t=e.callbackNode;Sf(e,n);var r=Fr(e,e===b?ee:0);if(r===0)t!==null&&Xo(t),e.callbackNode=null,e.callbackPriority=0;else if(n=r&-r,e.callbackPriority!==n){if(t!=null&&Xo(t),n===1)e.tag===0?kd(Vu.bind(null,e)):wa(Vu.bind(null,e)),gd(function(){!(L&6)&&vn()}),t=null;else{switch(Ys(r)){case 1:t=Jl;break;case 4:t=qs;break;case 16:t=Nr;break;case 536870912:t=Ks;break;default:t=Nr}t=yc(t,cc.bind(null,e))}e.callbackPriority=n,e.callbackNode=t}}function cc(e,n){if(Cr=-1,Tr=0,L&6)throw Error(y(327));var t=e.callbackNode;if(Zn()&&e.callbackNode!==t)return null;var r=Fr(e,e===b?ee:0);if(r===0)return null;if(r&30||r&e.expiredLanes||n)n=ei(e,r);else{n=r;var i=L;L|=2;var l=dc();(b!==e||ee!==n)&&(He=null,ot=K()+500,En(e,n));do try{Vd();break}catch(u){fc(e,u)}while(!0);co(),Jr.current=l,L=i,Q!==null?n=0:(b=null,ee=0,n=X)}if(n!==0){if(n===2&&(i=cl(e),i!==0&&(r=i,n=Rl(e,i))),n===1)throw t=Xt,En(e,0),tn(e,r),he(e,K()),t;if(n===6)tn(e,r);else{if(i=e.current.alternate,!(r&30)&&!Bd(i)&&(n=ei(e,r),n===2&&(l=cl(e),l!==0&&(r=l,n=Rl(e,l))),n===1))throw t=Xt,En(e,0),tn(e,r),he(e,K()),t;switch(e.finishedWork=i,e.finishedLanes=r,n){case 0:case 1:throw Error(y(345));case 2:_n(e,fe,He);break;case 3:if(tn(e,r),(r&130023424)===r&&(n=Eo+500-K(),10<n)){if(Fr(e,0)!==0)break;if(i=e.suspendedLanes,(i&r)!==r){se(),e.pingedLanes|=e.suspendedLanes&i;break}e.timeoutHandle=vl(_n.bind(null,e,fe,He),n);break}_n(e,fe,He);break;case 4:if(tn(e,r),(r&4194240)===r)break;for(n=e.eventTimes,i=-1;0<r;){var o=31-ze(r);l=1<<o,o=n[o],o>i&&(i=o),r&=~l}if(r=i,r=K()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Rd(r/1960))-r,10<r){e.timeoutHandle=vl(_n.bind(null,e,fe,He),r);break}_n(e,fe,He);break;case 5:_n(e,fe,He);break;default:throw Error(y(329))}}}return he(e,K()),e.callbackNode===t?cc.bind(null,e):null}function Rl(e,n){var t=Dt;return e.current.memoizedState.isDehydrated&&(En(e,n).flags|=256),e=ei(e,n),e!==2&&(n=fe,fe=t,n!==null&&Bl(n)),e}function Bl(e){fe===null?fe=e:fe.push.apply(fe,e)}function Bd(e){for(var n=e;;){if(n.flags&16384){var t=n.updateQueue;if(t!==null&&(t=t.stores,t!==null))for(var r=0;r<t.length;r++){var i=t[r],l=i.getSnapshot;i=i.value;try{if(!Fe(l(),i))return!1}catch{return!1}}}if(t=n.child,n.subtreeFlags&16384&&t!==null)t.return=n,n=t;else{if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function tn(e,n){for(n&=~$o,n&=~di,e.suspendedLanes|=n,e.pingedLanes&=~n,e=e.expirationTimes;0<n;){var t=31-ze(n),r=1<<t;e[t]=-1,n&=~r}}function Vu(e){if(L&6)throw Error(y(327));Zn();var n=Fr(e,0);if(!(n&1))return he(e,K()),null;var t=ei(e,n);if(e.tag!==0&&t===2){var r=cl(e);r!==0&&(n=r,t=Rl(e,r))}if(t===1)throw t=Xt,En(e,0),tn(e,n),he(e,K()),t;if(t===6)throw Error(y(345));return e.finishedWork=e.current.alternate,e.finishedLanes=n,_n(e,fe,He),he(e,K()),null}function Po(e,n){var t=L;L|=1;try{return e(n)}finally{L=t,L===0&&(ot=K()+500,si&&vn())}}function An(e){ln!==null&&ln.tag===0&&!(L&6)&&Zn();var n=L;L|=1;var t=$e.transition,r=z;try{if($e.transition=null,z=1,e)return e()}finally{z=r,$e.transition=t,L=n,!(L&6)&&vn()}}function jo(){ge=Qn.current,M(Qn)}function En(e,n){e.finishedWork=null,e.finishedLanes=0;var t=e.timeoutHandle;if(t!==-1&&(e.timeoutHandle=-1,hd(t)),Q!==null)for(t=Q.return;t!==null;){var r=t;switch(uo(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Vr();break;case 3:it(),M(pe),M(oe),yo();break;case 5:go(r);break;case 4:it();break;case 13:M(I);break;case 19:M(I);break;case 10:fo(r.type._context);break;case 22:case 23:jo()}t=t.return}if(b=e,Q=e=pn(e.current,null),ee=ge=n,X=0,Xt=null,$o=di=Dn=0,fe=Dt=null,xn!==null){for(n=0;n<xn.length;n++)if(t=xn[n],r=t.interleaved,r!==null){t.interleaved=null;var i=r.next,l=t.pending;if(l!==null){var o=l.next;l.next=i,r.next=o}t.pending=r}xn=null}return e}function fc(e,n){do{var t=Q;try{if(co(),Er.current=Gr,Xr){for(var r=V.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}Xr=!1}if(Tn=0,J=Y=V=null,Ct=!1,Kt=0,xo.current=null,t===null||t.return===null){X=1,Xt=n,Q=null;break}e:{var l=e,o=t.return,u=t,s=n;if(n=ee,u.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){var c=s,h=u,p=h.tag;if(!(h.mode&1)&&(p===0||p===11||p===15)){var m=h.alternate;m?(h.updateQueue=m.updateQueue,h.memoizedState=m.memoizedState,h.lanes=m.lanes):(h.updateQueue=null,h.memoizedState=null)}var v=ju(o);if(v!==null){v.flags&=-257,Cu(v,o,u,l,n),v.mode&1&&Pu(l,c,n),n=v,s=c;var w=n.updateQueue;if(w===null){var k=new Set;k.add(s),n.updateQueue=k}else w.add(s);break e}else{if(!(n&1)){Pu(l,c,n),Co();break e}s=Error(y(426))}}else if(B&&u.mode&1){var R=ju(o);if(R!==null){!(R.flags&65536)&&(R.flags|=256),Cu(R,o,u,l,n),so(lt(s,u));break e}}l=s=lt(s,u),X!==4&&(X=2),Dt===null?Dt=[l]:Dt.push(l),l=o;do{switch(l.tag){case 3:l.flags|=65536,n&=-n,l.lanes|=n;var f=Ya(l,s,n);Su(l,f);break e;case 1:u=s;var a=l.type,d=l.stateNode;if(!(l.flags&128)&&(typeof a.getDerivedStateFromError=="function"||d!==null&&typeof d.componentDidCatch=="function"&&(fn===null||!fn.has(d)))){l.flags|=65536,n&=-n,l.lanes|=n;var g=Xa(l,u,n);Su(l,g);break e}}l=l.return}while(l!==null)}mc(t)}catch(_){n=_,Q===t&&t!==null&&(Q=t=t.return);continue}break}while(!0)}function dc(){var e=Jr.current;return Jr.current=Gr,e===null?Gr:e}function Co(){(X===0||X===3||X===2)&&(X=4),b===null||!(Dn&268435455)&&!(di&268435455)||tn(b,ee)}function ei(e,n){var t=L;L|=2;var r=dc();(b!==e||ee!==n)&&(He=null,En(e,n));do try{Id();break}catch(i){fc(e,i)}while(!0);if(co(),L=t,Jr.current=r,Q!==null)throw Error(y(261));return b=null,ee=0,X}function Id(){for(;Q!==null;)pc(Q)}function Vd(){for(;Q!==null&&!df();)pc(Q)}function pc(e){var n=gc(e.alternate,e,ge);e.memoizedProps=e.pendingProps,n===null?mc(e):Q=n,xo.current=null}function mc(e){var n=e;do{var t=n.alternate;if(e=n.return,n.flags&32768){if(t=zd(t,n),t!==null){t.flags&=32767,Q=t;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{X=6,Q=null;return}}else if(t=Ld(t,n,ge),t!==null){Q=t;return}if(n=n.sibling,n!==null){Q=n;return}Q=n=e}while(n!==null);X===0&&(X=5)}function _n(e,n,t){var r=z,i=$e.transition;try{$e.transition=null,z=1,Hd(e,n,t,r)}finally{$e.transition=i,z=r}return null}function Hd(e,n,t,r){do Zn();while(ln!==null);if(L&6)throw Error(y(327));t=e.finishedWork;var i=e.finishedLanes;if(t===null)return null;if(e.finishedWork=null,e.finishedLanes=0,t===e.current)throw Error(y(177));e.callbackNode=null,e.callbackPriority=0;var l=t.lanes|t.childLanes;if(_f(e,l),e===b&&(Q=b=null,ee=0),!(t.subtreeFlags&2064)&&!(t.flags&2064)||vr||(vr=!0,yc(Nr,function(){return Zn(),null})),l=(t.flags&15990)!==0,t.subtreeFlags&15990||l){l=$e.transition,$e.transition=null;var o=z;z=1;var u=L;L|=4,xo.current=null,Fd(e,t),sc(t,e),sd(gl),Mr=!!hl,gl=hl=null,e.current=t,Md(t),pf(),L=u,z=o,$e.transition=l}else e.current=t;if(vr&&(vr=!1,ln=e,Zr=i),l=e.pendingLanes,l===0&&(fn=null),gf(t.stateNode),he(e,K()),n!==null)for(r=e.onRecoverableError,t=0;t<n.length;t++)i=n[t],r(i.value,{componentStack:i.stack,digest:i.digest});if(br)throw br=!1,e=Fl,Fl=null,e;return Zr&1&&e.tag!==0&&Zn(),l=e.pendingLanes,l&1?e===Ml?At++:(At=0,Ml=e):At=0,vn(),null}function Zn(){if(ln!==null){var e=Ys(Zr),n=$e.transition,t=z;try{if($e.transition=null,z=16>e?16:e,ln===null)var r=!1;else{if(e=ln,ln=null,Zr=0,L&6)throw Error(y(331));var i=L;for(L|=4,S=e.current;S!==null;){var l=S,o=l.child;if(S.flags&16){var u=l.deletions;if(u!==null){for(var s=0;s<u.length;s++){var c=u[s];for(S=c;S!==null;){var h=S;switch(h.tag){case 0:case 11:case 15:Tt(8,h,l)}var p=h.child;if(p!==null)p.return=h,S=p;else for(;S!==null;){h=S;var m=h.sibling,v=h.return;if(lc(h),h===c){S=null;break}if(m!==null){m.return=v,S=m;break}S=v}}}var w=l.alternate;if(w!==null){var k=w.child;if(k!==null){w.child=null;do{var R=k.sibling;k.sibling=null,k=R}while(k!==null)}}S=l}}if(l.subtreeFlags&2064&&o!==null)o.return=l,S=o;else e:for(;S!==null;){if(l=S,l.flags&2048)switch(l.tag){case 0:case 11:case 15:Tt(9,l,l.return)}var f=l.sibling;if(f!==null){f.return=l.return,S=f;break e}S=l.return}}var a=e.current;for(S=a;S!==null;){o=S;var d=o.child;if(o.subtreeFlags&2064&&d!==null)d.return=o,S=d;else e:for(o=a;S!==null;){if(u=S,u.flags&2048)try{switch(u.tag){case 0:case 11:case 15:fi(9,u)}}catch(_){W(u,u.return,_)}if(u===o){S=null;break e}var g=u.sibling;if(g!==null){g.return=u.return,S=g;break e}S=u.return}}if(L=i,vn(),Ie&&typeof Ie.onPostCommitFiberRoot=="function")try{Ie.onPostCommitFiberRoot(ri,e)}catch{}r=!0}return r}finally{z=t,$e.transition=n}}return!1}function Hu(e,n,t){n=lt(t,n),n=Ya(e,n,1),e=cn(e,n,1),n=se(),e!==null&&(Jt(e,1,n),he(e,n))}function W(e,n,t){if(e.tag===3)Hu(e,e,t);else for(;n!==null;){if(n.tag===3){Hu(n,e,t);break}else if(n.tag===1){var r=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(fn===null||!fn.has(r))){e=lt(t,e),e=Xa(n,e,1),n=cn(n,e,1),e=se(),n!==null&&(Jt(n,1,e),he(n,e));break}}n=n.return}}function Wd(e,n,t){var r=e.pingCache;r!==null&&r.delete(n),n=se(),e.pingedLanes|=e.suspendedLanes&t,b===e&&(ee&t)===t&&(X===4||X===3&&(ee&130023424)===ee&&500>K()-Eo?En(e,0):$o|=t),he(e,n)}function hc(e,n){n===0&&(e.mode&1?(n=sr,sr<<=1,!(sr&130023424)&&(sr=4194304)):n=1);var t=se();e=Xe(e,n),e!==null&&(Jt(e,n,t),he(e,t))}function Ud(e){var n=e.memoizedState,t=0;n!==null&&(t=n.retryLane),hc(e,t)}function qd(e,n){var t=0;switch(e.tag){case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(t=i.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(y(314))}r!==null&&r.delete(n),hc(e,t)}var gc;gc=function(e,n,t){if(e!==null)if(e.memoizedProps!==n.pendingProps||pe.current)de=!0;else{if(!(e.lanes&t)&&!(n.flags&128))return de=!1,Ad(e,n,t);de=!!(e.flags&131072)}else de=!1,B&&n.flags&1048576&&ka(n,Ur,n.index);switch(n.lanes=0,n.tag){case 2:var r=n.type;jr(e,n),e=n.pendingProps;var i=nt(n,oe.current);bn(n,t),i=wo(null,n,r,e,i,t);var l=ko();return n.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(n.tag=1,n.memoizedState=null,n.updateQueue=null,me(r)?(l=!0,Hr(n)):l=!1,n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,mo(n),i.updater=ci,n.stateNode=i,i._reactInternals=n,$l(n,r,e,t),n=jl(null,n,r,!0,l,t)):(n.tag=0,B&&l&&oo(n),ue(null,n,i,t),n=n.child),n;case 16:r=n.elementType;e:{switch(jr(e,n),e=n.pendingProps,i=r._init,r=i(r._payload),n.type=r,i=n.tag=Qd(r),e=Te(r,e),i){case 0:n=Pl(null,n,r,e,t);break e;case 1:n=Au(null,n,r,e,t);break e;case 11:n=Tu(null,n,r,e,t);break e;case 14:n=Du(null,n,r,Te(r.type,e),t);break e}throw Error(y(306,r,""))}return n;case 0:return r=n.type,i=n.pendingProps,i=n.elementType===r?i:Te(r,i),Pl(e,n,r,i,t);case 1:return r=n.type,i=n.pendingProps,i=n.elementType===r?i:Te(r,i),Au(e,n,r,i,t);case 3:e:{if(Za(n),e===null)throw Error(y(387));r=n.pendingProps,l=n.memoizedState,i=l.element,Ea(e,n),Qr(n,r,null,t);var o=n.memoizedState;if(r=o.element,l.isDehydrated)if(l={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},n.updateQueue.baseState=l,n.memoizedState=l,n.flags&256){i=lt(Error(y(423)),n),n=Lu(e,n,r,t,i);break e}else if(r!==i){i=lt(Error(y(424)),n),n=Lu(e,n,r,t,i);break e}else for(ye=an(n.stateNode.containerInfo.firstChild),ve=n,B=!0,Ae=null,t=xa(n,null,r,t),n.child=t;t;)t.flags=t.flags&-3|4096,t=t.sibling;else{if(tt(),r===i){n=Ge(e,n,t);break e}ue(e,n,r,t)}n=n.child}return n;case 5:return Pa(n),e===null&&_l(n),r=n.type,i=n.pendingProps,l=e!==null?e.memoizedProps:null,o=i.children,yl(r,i)?o=null:l!==null&&yl(r,l)&&(n.flags|=32),ba(e,n),ue(e,n,o,t),n.child;case 6:return e===null&&_l(n),null;case 13:return ec(e,n,t);case 4:return ho(n,n.stateNode.containerInfo),r=n.pendingProps,e===null?n.child=rt(n,null,r,t):ue(e,n,r,t),n.child;case 11:return r=n.type,i=n.pendingProps,i=n.elementType===r?i:Te(r,i),Tu(e,n,r,i,t);case 7:return ue(e,n,n.pendingProps,t),n.child;case 8:return ue(e,n,n.pendingProps.children,t),n.child;case 12:return ue(e,n,n.pendingProps.children,t),n.child;case 10:e:{if(r=n.type._context,i=n.pendingProps,l=n.memoizedProps,o=i.value,N(qr,r._currentValue),r._currentValue=o,l!==null)if(Fe(l.value,o)){if(l.children===i.children&&!pe.current){n=Ge(e,n,t);break e}}else for(l=n.child,l!==null&&(l.return=n);l!==null;){var u=l.dependencies;if(u!==null){o=l.child;for(var s=u.firstContext;s!==null;){if(s.context===r){if(l.tag===1){s=Ke(-1,t&-t),s.tag=2;var c=l.updateQueue;if(c!==null){c=c.shared;var h=c.pending;h===null?s.next=s:(s.next=h.next,h.next=s),c.pending=s}}l.lanes|=t,s=l.alternate,s!==null&&(s.lanes|=t),Ol(l.return,t,n),u.lanes|=t;break}s=s.next}}else if(l.tag===10)o=l.type===n.type?null:l.child;else if(l.tag===18){if(o=l.return,o===null)throw Error(y(341));o.lanes|=t,u=o.alternate,u!==null&&(u.lanes|=t),Ol(o,t,n),o=l.sibling}else o=l.child;if(o!==null)o.return=l;else for(o=l;o!==null;){if(o===n){o=null;break}if(l=o.sibling,l!==null){l.return=o.return,o=l;break}o=o.return}l=o}ue(e,n,i.children,t),n=n.child}return n;case 9:return i=n.type,r=n.pendingProps.children,bn(n,t),i=Ee(i),r=r(i),n.flags|=1,ue(e,n,r,t),n.child;case 14:return r=n.type,i=Te(r,n.pendingProps),i=Te(r.type,i),Du(e,n,r,i,t);case 15:return Ga(e,n,n.type,n.pendingProps,t);case 17:return r=n.type,i=n.pendingProps,i=n.elementType===r?i:Te(r,i),jr(e,n),n.tag=1,me(r)?(e=!0,Hr(n)):e=!1,bn(n,t),Qa(n,r,i),$l(n,r,i,t),jl(null,n,r,!0,e,t);case 19:return nc(e,n,t);case 22:return Ja(e,n,t)}throw Error(y(156,n.tag))};function yc(e,n){return Us(e,n)}function Kd(e,n,t,r){this.tag=e,this.key=t,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function xe(e,n,t,r){return new Kd(e,n,t,r)}function To(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Qd(e){if(typeof e=="function")return To(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Yl)return 11;if(e===Xl)return 14}return 2}function pn(e,n){var t=e.alternate;return t===null?(t=xe(e.tag,n,e.key,e.mode),t.elementType=e.elementType,t.type=e.type,t.stateNode=e.stateNode,t.alternate=e,e.alternate=t):(t.pendingProps=n,t.type=e.type,t.flags=0,t.subtreeFlags=0,t.deletions=null),t.flags=e.flags&14680064,t.childLanes=e.childLanes,t.lanes=e.lanes,t.child=e.child,t.memoizedProps=e.memoizedProps,t.memoizedState=e.memoizedState,t.updateQueue=e.updateQueue,n=e.dependencies,t.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},t.sibling=e.sibling,t.index=e.index,t.ref=e.ref,t}function Dr(e,n,t,r,i,l){var o=2;if(r=e,typeof e=="function")To(e)&&(o=1);else if(typeof e=="string")o=5;else e:switch(e){case Mn:return Pn(t.children,i,l,n);case Ql:o=8,i|=8;break;case Xi:return e=xe(12,t,n,i|2),e.elementType=Xi,e.lanes=l,e;case Gi:return e=xe(13,t,n,i),e.elementType=Gi,e.lanes=l,e;case Ji:return e=xe(19,t,n,i),e.elementType=Ji,e.lanes=l,e;case Ps:return pi(t,i,l,n);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case $s:o=10;break e;case Es:o=9;break e;case Yl:o=11;break e;case Xl:o=14;break e;case Ze:o=16,r=null;break e}throw Error(y(130,e==null?e:typeof e,""))}return n=xe(o,t,n,i),n.elementType=e,n.type=r,n.lanes=l,n}function Pn(e,n,t,r){return e=xe(7,e,r,n),e.lanes=t,e}function pi(e,n,t,r){return e=xe(22,e,r,n),e.elementType=Ps,e.lanes=t,e.stateNode={isHidden:!1},e}function qi(e,n,t){return e=xe(6,e,null,n),e.lanes=t,e}function Ki(e,n,t){return n=xe(4,e.children!==null?e.children:[],e.key,n),n.lanes=t,n.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},n}function Yd(e,n,t,r,i){this.tag=n,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ei(0),this.expirationTimes=Ei(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ei(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function Do(e,n,t,r,i,l,o,u,s){return e=new Yd(e,n,t,u,s),n===1?(n=1,l===!0&&(n|=8)):n=0,l=xe(3,null,null,n),e.current=l,l.stateNode=e,l.memoizedState={element:r,isDehydrated:t,cache:null,transitions:null,pendingSuspenseBoundaries:null},mo(l),e}function Xd(e,n,t){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Fn,key:r==null?null:""+r,children:e,containerInfo:n,implementation:t}}function vc(e){if(!e)return hn;e=e._reactInternals;e:{if(zn(e)!==e||e.tag!==1)throw Error(y(170));var n=e;do{switch(n.tag){case 3:n=n.stateNode.context;break e;case 1:if(me(n.type)){n=n.stateNode.__reactInternalMemoizedMergedChildContext;break e}}n=n.return}while(n!==null);throw Error(y(171))}if(e.tag===1){var t=e.type;if(me(t))return va(e,t,n)}return n}function wc(e,n,t,r,i,l,o,u,s){return e=Do(t,r,!0,e,i,l,o,u,s),e.context=vc(null),t=e.current,r=se(),i=dn(t),l=Ke(r,i),l.callback=n??null,cn(t,l,i),e.current.lanes=i,Jt(e,i,r),he(e,r),e}function mi(e,n,t,r){var i=n.current,l=se(),o=dn(i);return t=vc(t),n.context===null?n.context=t:n.pendingContext=t,n=Ke(l,o),n.payload={element:e},r=r===void 0?null:r,r!==null&&(n.callback=r),e=cn(i,n,o),e!==null&&(Ne(e,i,o,l),$r(e,i,o)),o}function ni(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Wu(e,n){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var t=e.retryLane;e.retryLane=t!==0&&t<n?t:n}}function Ao(e,n){Wu(e,n),(e=e.alternate)&&Wu(e,n)}function Gd(){return null}var kc=typeof reportError=="function"?reportError:function(e){console.error(e)};function Lo(e){this._internalRoot=e}hi.prototype.render=Lo.prototype.render=function(e){var n=this._internalRoot;if(n===null)throw Error(y(409));mi(e,n,null,null)};hi.prototype.unmount=Lo.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var n=e.containerInfo;An(function(){mi(null,e,null,null)}),n[Ye]=null}};function hi(e){this._internalRoot=e}hi.prototype.unstable_scheduleHydration=function(e){if(e){var n=Js();e={blockedOn:null,target:e,priority:n};for(var t=0;t<nn.length&&n!==0&&n<nn[t].priority;t++);nn.splice(t,0,e),t===0&&Zs(e)}};function zo(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function gi(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Uu(){}function Jd(e,n,t,r,i){if(i){if(typeof r=="function"){var l=r;r=function(){var c=ni(o);l.call(c)}}var o=wc(n,r,e,0,null,!1,!1,"",Uu);return e._reactRootContainer=o,e[Ye]=o.current,Vt(e.nodeType===8?e.parentNode:e),An(),o}for(;i=e.lastChild;)e.removeChild(i);if(typeof r=="function"){var u=r;r=function(){var c=ni(s);u.call(c)}}var s=Do(e,0,!1,null,null,!1,!1,"",Uu);return e._reactRootContainer=s,e[Ye]=s.current,Vt(e.nodeType===8?e.parentNode:e),An(function(){mi(n,s,t,r)}),s}function yi(e,n,t,r,i){var l=t._reactRootContainer;if(l){var o=l;if(typeof i=="function"){var u=i;i=function(){var s=ni(o);u.call(s)}}mi(n,o,e,i)}else o=Jd(t,n,e,i,r);return ni(o)}Xs=function(e){switch(e.tag){case 3:var n=e.stateNode;if(n.current.memoizedState.isDehydrated){var t=_t(n.pendingLanes);t!==0&&(bl(n,t|1),he(n,K()),!(L&6)&&(ot=K()+500,vn()))}break;case 13:An(function(){var r=Xe(e,1);if(r!==null){var i=se();Ne(r,e,1,i)}}),Ao(e,1)}};Zl=function(e){if(e.tag===13){var n=Xe(e,134217728);if(n!==null){var t=se();Ne(n,e,134217728,t)}Ao(e,134217728)}};Gs=function(e){if(e.tag===13){var n=dn(e),t=Xe(e,n);if(t!==null){var r=se();Ne(t,e,n,r)}Ao(e,n)}};Js=function(){return z};bs=function(e,n){var t=z;try{return z=e,n()}finally{z=t}};ul=function(e,n,t){switch(n){case"input":if(el(e,t),n=t.name,t.type==="radio"&&n!=null){for(t=e;t.parentNode;)t=t.parentNode;for(t=t.querySelectorAll("input[name="+JSON.stringify(""+n)+'][type="radio"]'),n=0;n<t.length;n++){var r=t[n];if(r!==e&&r.form===e.form){var i=ui(r);if(!i)throw Error(y(90));Cs(r),el(r,i)}}}break;case"textarea":Ds(e,t);break;case"select":n=t.value,n!=null&&Yn(e,!!t.multiple,n,!1)}};Rs=Po;Bs=An;var bd={usingClientEntryPoint:!1,Events:[Zt,Vn,ui,Fs,Ms,Po]},wt={findFiberByHostInstance:On,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Zd={bundleType:wt.bundleType,version:wt.version,rendererPackageName:wt.rendererPackageName,rendererConfig:wt.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Je.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Hs(e),e===null?null:e.stateNode},findFiberByHostInstance:wt.findFiberByHostInstance||Gd,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var wr=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!wr.isDisabled&&wr.supportsFiber)try{ri=wr.inject(Zd),Ie=wr}catch{}}ke.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=bd;ke.createPortal=function(e,n){var t=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!zo(n))throw Error(y(200));return Xd(e,n,null,t)};ke.createRoot=function(e,n){if(!zo(e))throw Error(y(299));var t=!1,r="",i=kc;return n!=null&&(n.unstable_strictMode===!0&&(t=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onRecoverableError!==void 0&&(i=n.onRecoverableError)),n=Do(e,1,!1,null,null,t,!1,r,i),e[Ye]=n.current,Vt(e.nodeType===8?e.parentNode:e),new Lo(n)};ke.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var n=e._reactInternals;if(n===void 0)throw typeof e.render=="function"?Error(y(188)):(e=Object.keys(e).join(","),Error(y(268,e)));return e=Hs(n),e=e===null?null:e.stateNode,e};ke.flushSync=function(e){return An(e)};ke.hydrate=function(e,n,t){if(!gi(n))throw Error(y(200));return yi(null,e,n,!0,t)};ke.hydrateRoot=function(e,n,t){if(!zo(e))throw Error(y(405));var r=t!=null&&t.hydratedSources||null,i=!1,l="",o=kc;if(t!=null&&(t.unstable_strictMode===!0&&(i=!0),t.identifierPrefix!==void 0&&(l=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),n=wc(n,null,e,1,t??null,i,!1,l,o),e[Ye]=n.current,Vt(e),r)for(e=0;e<r.length;e++)t=r[e],i=t._getVersion,i=i(t._source),n.mutableSourceEagerHydrationData==null?n.mutableSourceEagerHydrationData=[t,i]:n.mutableSourceEagerHydrationData.push(t,i);return new hi(n)};ke.render=function(e,n,t){if(!gi(n))throw Error(y(200));return yi(null,e,n,!1,t)};ke.unmountComponentAtNode=function(e){if(!gi(e))throw Error(y(40));return e._reactRootContainer?(An(function(){yi(null,null,e,!1,function(){e._reactRootContainer=null,e[Ye]=null})}),!0):!1};ke.unstable_batchedUpdates=Po;ke.unstable_renderSubtreeIntoContainer=function(e,n,t,r){if(!gi(t))throw Error(y(200));if(e==null||e._reactInternals===void 0)throw Error(y(38));return yi(e,n,t,!1,r)};ke.version="18.3.1-next-f1338f8080-20240426";function Sc(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Sc)}catch(e){console.error(e)}}Sc(),Ss.exports=ke;var ep=Ss.exports,qu=ep;Qi.createRoot=qu.createRoot,Qi.hydrateRoot=qu.hydrateRoot;const np="modulepreload",tp=function(e){return"/"+e},Ku={},x=function(n,t,r){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),u=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(t.map(s=>{if(s=tp(s),s in Ku)return;Ku[s]=!0;const c=s.endsWith(".css"),h=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${h}`))return;const p=document.createElement("link");if(p.rel=c?"stylesheet":np,c||(p.as="script"),p.crossOrigin="",p.href=s,u&&p.setAttribute("nonce",u),document.head.appendChild(p),c)return new Promise((m,v)=>{p.addEventListener("load",m),p.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${s}`)))})}))}function l(o){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=o,window.dispatchEvent(u),!u.defaultPrevented)throw o}return i.then(o=>{for(const u of o||[])u.status==="rejected"&&l(u.reason);return n().catch(l)})},rp="array",ip="数组",lp="最基础的线性数据结构，连续内存存储，支持随机访问",op="基础线性结构",up="beginner",sp=["线性结构","随机访问","连续存储"],ap=1,cp={id:rp,title:ip,description:lp,category:op,difficulty:up,tags:sp,order:ap},fp=[{question:"数组通过索引访问元素的时间复杂度是多少？",options:["O(n)","O(log n)","O(1)","O(n²)"],answer:2,explanation:"数组支持随机访问，通过基地址 + 索引 × 元素大小可以直接计算出内存地址，因此时间复杂度为 O(1)。这是数组最重要的特性之一。"},{question:"数组在内存中的存储方式是什么？",options:["链式存储","连续存储","树形存储","散列存储"],answer:1,explanation:"数组要求所有元素在内存中连续存放，这也是它能够实现 O(1) 随机访问的基础。连续存储还带来了良好的缓存局部性。"},{question:"在数组头部插入一个元素的时间复杂度是多少？",options:["O(1)","O(log n)","O(n)","O(n²)"],answer:2,explanation:"在数组头部插入元素时，需要将所有现有元素向后移动一位，以腾出空间。如果有 n 个元素，就需要移动 n 次，因此时间复杂度为 O(n)。"},{question:"以下哪个不是数组的主要优点？",options:["随机访问 O(1)","缓存友好","动态扩容方便","内存紧凑"],answer:2,explanation:"数组的大小在创建时就已固定，动态扩容需要重新分配内存并复制所有元素，代价很高。链表等数据结构在插入和扩容方面更灵活。"},{question:"一个包含 10 个 int 元素的数组（每个 int 占 4 字节），基地址为 1000，则索引为 5 的元素地址是多少？",options:["1020","1024","1028","1032"],answer:0,explanation:"地址计算公式：基地址 + 索引 × 元素大小 = 1000 + 5 × 4 = 1000 + 20 = 1020。这就是数组能够实现 O(1) 访问的数学原理。"}],dp="queue",pp="队列",mp="先进先出(FIFO)的线性结构，任务调度和缓冲区的核心",hp="基础线性结构",gp="beginner",yp=["FIFO","线性结构","BFS"],vp=4,wp={id:dp,title:pp,description:mp,category:hp,difficulty:gp,tags:yp,order:vp},kp=[{question:"队列的核心特性是什么？",options:["后进先出 (LIFO)","先进先出 (FIFO)","随机访问","优先级排序"],answer:1,explanation:"队列是先进先出 (FIFO) 的数据结构，最先入队的元素最先出队，就像排队买饭一样。后进先出是栈的特性。"},{question:"循环队列中，如何判断队列是否已满？",options:["front === rear","(rear + 1) % capacity === front（牺牲一个空间）","rear === capacity - 1","front === 0 && rear === capacity - 1"],answer:1,explanation:'循环队列常用"牺牲一个空间"的方法判满：当 (rear+1)%capacity === front 时认为队满。如果只用 front===rear 判断，无法区分队空和队满。也可以额外维护一个 size 变量。'},{question:"队列和栈的主要区别是什么？",options:["队列是先进后出，栈是先进先出","队列是先进先出，栈是后进先出","队列只能存储数字，栈可以存储任意类型","队列比栈更快"],answer:1,explanation:"队列是 FIFO（先进先出），元素从队尾进、队头出；栈是 LIFO（后进先出），只在栈顶进行插入和删除。它们的访问顺序完全相反。"},{question:"BFS（广度优先搜索）与队列的关系是什么？",options:["BFS 使用栈来实现","BFS 使用队列来实现层序遍历","BFS 不需要任何数据结构","BFS 使用堆来实现"],answer:1,explanation:"BFS 使用队列来实现层序遍历：将起始节点入队，然后循环取出队头节点并将其未访问的邻居入队。这保证了按层级顺序访问节点。"},{question:"以下哪个场景最适合使用队列？",options:["撤销操作（Undo）","函数调用栈","打印机任务调度","浏览器前进后退"],answer:2,explanation:"打印机任务调度使用队列：先提交的任务先打印，符合 FIFO 原则。撤销操作、函数调用栈、浏览器前进后退都使用栈（LIFO）。"}];class Sp{constructor(){Fo(this,"topics",new Map)}register(n,t){this.topics.set(n,t)}get(n){return this.topics.get(n)}getAll(){return Array.from(this.topics.values()).map(n=>n.metadata).sort((n,t)=>n.order-t.order)}}const te=new Sp,_p=`
<h2>什么是数组？</h2>
<p>数组（Array）是最基础、最常用的数据结构之一。它是一组<strong>相同类型</strong>元素的集合，这些元素在内存中<strong>连续存放</strong>，并通过<strong>索引</strong>（下标）来访问每个元素。</p>
<p>想象一排储物柜，每个柜子大小相同，整齐排列。你可以通过柜子编号（索引）直接找到任何一个柜子，这就是数组的核心思想。</p>
<pre><code class="language-typescript">// 创建一个包含 5 个数字的数组
const numbers: number[] = [10, 25, 33, 47, 58]

// 通过索引访问元素
console.log(numbers[0])  // 10（第一个元素）
console.log(numbers[3])  // 47（第四个元素）
</code></pre>

<h2>数组为什么重要？</h2>
<h3>1. 数据结构的基石</h3>
<p>数组是几乎所有高级数据结构的基础。栈、队列、哈希表、堆、图的邻接矩阵等，底层都可以用数组来实现。理解数组，是学习其他数据结构的前提。</p>

<h3>2. 缓存友好（Cache Friendly）</h3>
<p>由于数组元素在内存中连续存放，当访问一个元素时，CPU 会把相邻的元素也加载到缓存中（缓存行，Cache Line）。这意味着遍历数组的速度通常比遍历链表快得多，即使两者的时间复杂度都是 O(n)。</p>
<pre><code>内存布局示意：

地址:  1000  1004  1008  1012  1016
      +-----+-----+-----+-----+-----+
数据:  | 10  | 25  | 33  | 47  | 58  |
      +-----+-----+-----+-----+-----+
索引:    [0]   [1]   [2]   [3]   [4]

连续存储 → 缓存一次可以加载多个元素
</code></pre>

<h3>3. 随机访问 O(1)</h3>
<p>数组最大的优势是可以用 O(1) 时间访问任意位置的元素。这得益于连续内存布局带来的简单地址计算公式。</p>

<h2>核心原理</h2>
<h3>地址计算公式</h3>
<p>数组元素的内存地址可以通过以下公式直接计算：</p>
<pre><code>元素地址 = 基地址 + 索引 × 元素大小
address(arr[i]) = base_address + i × sizeof(element)
</code></pre>
<p>例如，一个 <code>int</code> 数组（每个 int 占 4 字节），基地址为 1000：</p>
<table>
<thead><tr><th>索引</th><th>计算过程</th><th>地址</th></tr></thead>
<tbody>
<tr><td>0</td><td>1000 + 0 × 4</td><td>1000</td></tr>
<tr><td>1</td><td>1000 + 1 × 4</td><td>1004</td></tr>
<tr><td>2</td><td>1000 + 2 × 4</td><td>1008</td></tr>
<tr><td>3</td><td>1000 + 3 × 4</td><td>1012</td></tr>
<tr><td>4</td><td>1000 + 4 × 4</td><td>1016</td></tr>
</tbody>
</table>
<p>无论数组有多大，访问任意元素都只需要一次计算，这就是 O(1) 的秘密。</p>

<h3>时间复杂度</h3>
<table>
<thead><tr><th>操作</th><th>时间复杂度</th><th>说明</th></tr></thead>
<tbody>
<tr><td>随机访问</td><td>O(1)</td><td>通过索引直接计算地址</td></tr>
<tr><td>线性查找</td><td>O(n)</td><td>最坏情况需要遍历所有元素</td></tr>
<tr><td>末尾插入</td><td>O(1)</td><td>直接放到末尾</td></tr>
<tr><td>中间插入</td><td>O(n)</td><td>需要移动后续元素</td></tr>
<tr><td>末尾删除</td><td>O(1)</td><td>直接移除末尾</td></tr>
<tr><td>中间删除</td><td>O(n)</td><td>需要移动后续元素</td></tr>
</tbody>
</table>

<h2>可视化说明</h2>
<p>在右侧的可视化面板中，你可以直观地观察数组的各种操作：</p>
<ul>
<li><strong>插入动画</strong>：新元素插入时，后续元素依次向右移动，为新元素腾出空间</li>
<li><strong>删除动画</strong>：删除元素后，后续元素依次向左移动，填补空位</li>
<li><strong>查找动画</strong>：从左到右逐个比较，高亮当前正在比较的元素</li>
</ul>
<p>通过动画控制栏，你可以：</p>
<ul>
<li>播放 / 暂停动画</li>
<li>调整动画速度</li>
<li>重置到初始状态</li>
</ul>

<h2>常见错误</h2>
<h3>1. 数组越界（Off-by-One / Out of Bounds）</h3>
<pre><code class="language-typescript">const arr = [1, 2, 3, 4, 5]

// ❌ 错误：索引从 0 开始，最大索引是 length - 1
console.log(arr[5])   // undefined（越界）

// ❌ 错误：循环条件应该是 i &lt; length，不是 i &lt;= length
for (let i = 0; i &lt;= arr.length; i++) {
  console.log(arr[i]) // 最后一次会越界
}

// ✅ 正确：使用 &lt; 而不是 &lt;=
for (let i = 0; i &lt; arr.length; i++) {
  console.log(arr[i])
}
</code></pre>

<h3>2. 缓冲区溢出（Buffer Overflow）</h3>
<p>在低级语言（如 C/C++）中，访问越界数组不会报错，而是访问了相邻内存的数据，这可能导致程序崩溃或安全漏洞。TypeScript/JavaScript 会返回 <code>undefined</code>，但逻辑错误仍然存在。</p>

<h3>3. 混淆索引和长度</h3>
<pre><code class="language-typescript">const arr = [10, 20, 30]

// ❌ 错误：arr.length 是 3，不是最后一个元素的索引
console.log(arr[arr.length])     // undefined

// ✅ 正确：最后一个元素的索引是 length - 1
console.log(arr[arr.length - 1]) // 30
</code></pre>

<h2>实际应用</h2>
<h3>1. 查找表（Lookup Table）</h3>
<p>当需要频繁通过索引查找值时，数组是最佳选择：</p>
<pre><code class="language-typescript">// 星期几的名称
const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const today = new Date().getDay()
console.log(\`今天是\${dayNames[today]}\`)
</code></pre>

<h3>2. 缓冲区（Buffer）</h3>
<p>音频、视频、网络数据包的处理中，数据通常存储在数组缓冲区中：</p>
<pre><code class="language-typescript">// 处理二进制数据
const buffer = new ArrayBuffer(1024)  // 1KB 缓冲区
const view = new Uint8Array(buffer)
view[0] = 0xFF
view[1] = 0xAA
</code></pre>

<h3>3. 矩阵运算</h3>
<p>二维数组常用于表示矩阵，广泛应用于图像处理、机器学习等领域：</p>
<pre><code class="language-typescript">// 3x3 矩阵
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]

// 访问第 2 行第 3 列的元素
console.log(matrix[1][2])  // 6
</code></pre>

<h3>4. 实现其他数据结构</h3>
<pre><code class="language-typescript">// 用数组实现栈
class Stack&lt;T&gt; {
  private items: T[] = []
  push(item: T) { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
  peek(): T | undefined { return this.items[this.items.length - 1] }
  get size(): number { return this.items.length }
}

// 用数组实现队列（环形缓冲区更高效）
class Queue&lt;T&gt; {
  private items: T[] = []
  enqueue(item: T) { this.items.push(item) }
  dequeue(): T | undefined { return this.items.shift() }
  get size(): number { return this.items.length }
}
</code></pre>

<h2>总结</h2>
<p>数组是最基础的数据结构，理解它对于学习计算机科学至关重要：</p>
<ul>
<li><strong>连续内存存储</strong>：元素紧密排列，带来优秀的缓存性能</li>
<li><strong>O(1) 随机访问</strong>：通过地址公式直接定位元素</li>
<li><strong>固定大小</strong>：创建时确定大小，扩容需要重新分配内存</li>
<li><strong>插入/删除较慢</strong>：中间操作需要移动元素，时间复杂度 O(n)</li>
<li><strong>广泛应用</strong>：查找表、缓冲区、矩阵、底层实现各种数据结构</li>
</ul>
<p>掌握数组的特性和适用场景，是成为优秀程序员的第一步。在接下来的主题中，我们将学习链表——另一种线性数据结构，它在插入和删除方面有更好的表现，但牺牲了随机访问的能力。</p>
`;te.register("array",{metadata:cp,articleHtml:_p,quiz:fp,getVisualization:()=>x(()=>import("./visualization-vTXhTB4j.js"),[]),getDemo:()=>x(()=>import("./demo-B2h8XQOi.js"),[])});const Op=`
<h2>概念解释</h2>
<p>队列是一种<strong>先进先出 (FIFO, First In First Out)</strong> 的线性数据结构。</p>
<p>想象你在食堂排队打饭：先来的人先打饭，后来的人排在后面。这就是队列的核心思想。</p>

<h3>核心术语</h3>
<ul>
<li><strong>入队 (Enqueue)</strong>：将元素添加到队列的尾部（rear）</li>
<li><strong>出队 (Dequeue)</strong>：从队列的头部（front）移除元素</li>
<li><strong>队头 (Front)</strong>：队列的第一个元素，即将被取出的元素</li>
<li><strong>队尾 (Rear)</strong>：队列的最后一个元素，刚刚进入的元素</li>
</ul>
<pre><code>入队方向 →
  ┌───┬───┬───┬───┬───┐
  │ A │ B │ C │ D │ E │
  └───┴───┴───┴───┴───┘
  队头 ↑               ↑ 队尾
 (front)            (rear)
                 → 出队方向
</code></pre>

<h2>为什么重要</h2>
<p>队列在计算机科学中无处不在：</p>
<ol>
<li><strong>广度优先搜索 (BFS)</strong>：图和树的层序遍历必须使用队列</li>
<li><strong>任务调度</strong>：操作系统使用队列管理进程和线程</li>
<li><strong>打印队列</strong>：打印机按顺序处理打印任务</li>
<li><strong>消息队列</strong>：分布式系统中异步通信的基础（如 RabbitMQ、Kafka）</li>
<li><strong>缓冲区</strong>：视频播放、网络数据包都使用队列缓冲</li>
</ol>

<h2>核心原理</h2>
<h3>数组实现：循环队列</h3>
<p>普通数组实现队列有一个问题：出队后前面的空间无法复用。</p>
<pre><code>初始:   [A, B, C, D, _, _]  front=0, rear=4
出队后: [_, B, C, D, _, _]  front=1, rear=4
问题：前面的空间浪费了！
</code></pre>
<p><strong>循环队列</strong>通过取模运算让数组"首尾相连"：</p>
<pre><code class="language-typescript">class CircularQueue {
  private data: (number | null)[]
  private front: number = 0
  private rear: number = 0
  private size: number = 0
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.data = new Array(capacity).fill(null)
  }

  enqueue(val: number): boolean {
    if (this.size === this.capacity) return false  // 队满
    this.data[this.rear] = val
    this.rear = (this.rear + 1) % this.capacity  // 关键：取模
    this.size++
    return true
  }

  dequeue(): number | null {
    if (this.size === 0) return null  // 队空
    const val = this.data[this.front]
    this.data[this.front] = null
    this.front = (this.front + 1) % this.capacity  // 关键：取模
    this.size--
    return val
  }
}
</code></pre>

<h3>链表实现</h3>
<p>使用链表实现队列更加直观：</p>
<pre><code class="language-typescript">class LinkedQueue {
  private front: Node | null = null
  private rear: Node | null = null

  enqueue(val: number): void {
    const node = new Node(val)
    if (!this.rear) {
      this.front = this.rear = node
    } else {
      this.rear.next = node
      this.rear = node
    }
  }

  dequeue(): number | null {
    if (!this.front) return null
    const val = this.front.val
    this.front = this.front.next
    if (!this.front) this.rear = null
    return val
  }
}
</code></pre>

<h3>时间复杂度</h3>
<table>
<thead><tr><th>操作</th><th>数组循环队列</th><th>链表队列</th></tr></thead>
<tbody>
<tr><td>入队</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>出队</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>查看队头</td><td>O(1)</td><td>O(1)</td></tr>
</tbody>
</table>

<h2>可视化说明</h2>
<p>可视化展示了队列的核心操作：</p>
<ul>
<li><strong>入队动画</strong>：新元素从右侧滑入队尾</li>
<li><strong>出队动画</strong>：队头元素从左侧滑出</li>
<li><strong>循环队列</strong>：展示数组如何首尾相连</li>
<li><strong>BFS 演示</strong>：在图上展示 BFS 如何使用队列</li>
</ul>

<h2>常见错误</h2>
<h3>1. 循环队列判空判满混淆</h3>
<pre><code class="language-typescript">// 错误：只用 front == rear 判断
if (this.front === this.rear) return true  // 无法区分空和满！

// 正确：使用 size 变量，或牺牲一个空间
isEmpty(): boolean { return this.size === 0 }
isFull(): boolean { return this.size === this.capacity }
</code></pre>

<h3>2. 循环缓冲区的 off-by-one 错误</h3>
<pre><code class="language-typescript">// 错误：忘记取模
this.rear = this.rear + 1  // 可能越界！

// 正确：始终取模
this.rear = (this.rear + 1) % this.capacity
</code></pre>

<h3>3. 空队列操作</h3>
<pre><code class="language-typescript">// 错误：不检查空队列就出队
const val = this.data[this.front]  // 可能是 null！

// 正确：先检查
if (this.size === 0) throw new Error("队列为空")
</code></pre>

<h2>实际应用</h2>
<h3>1. BFS（广度优先搜索）</h3>
<pre><code class="language-typescript">function bfs(graph: number[][], start: number): number[] {
  const visited = new Set&lt;number&gt;()
  const queue: number[] = [start]
  const result: number[] = []
  visited.add(start)

  while (queue.length &gt; 0) {
    const node = queue.shift()!
    result.push(node)
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  return result
}
</code></pre>

<h3>2. 消息队列</h3>
<p>分布式系统中，生产者将消息放入队列，消费者从队列取出处理，实现异步解耦。</p>

<h3>3. 打印任务调度</h3>
<p>多个用户提交打印任务，打印机按 FIFO 顺序处理。</p>

<h3>4. CPU 进程调度</h3>
<p>操作系统使用就绪队列管理等待 CPU 时间片的进程。</p>

<h2>总结</h2>
<p>队列是最重要的基础数据结构之一：</p>
<ul>
<li><strong>核心思想</strong>：先进先出 (FIFO)</li>
<li><strong>关键操作</strong>：入队 O(1)，出队 O(1)</li>
<li><strong>实现方式</strong>：循环数组 或 链表</li>
<li><strong>核心应用</strong>：BFS、任务调度、消息队列、缓冲区</li>
</ul>
<p>掌握队列是理解 BFS、操作系统调度、分布式系统等高级主题的基础。</p>
`;te.register("queue",{metadata:wp,articleHtml:Op,quiz:kp,getVisualization:()=>x(()=>import("./visualization-BCUK9QDK.js"),[]),getDemo:()=>x(()=>import("./demo-CVrwIivv.js"),[])});function xp({onSelect:e}){const n=te.getAll(),t=["基础线性结构","树形结构","排序算法","搜索算法"];return j.jsxs("div",{className:"topic-list",children:[j.jsx("h2",{children:"选择主题"}),t.map(r=>{const i=n.filter(l=>l.category===r);return i.length===0?null:j.jsxs("section",{className:"category-section",children:[j.jsx("h3",{children:r}),j.jsx("div",{className:"topic-grid",children:i.map(l=>j.jsxs("div",{className:"topic-card",onClick:()=>e(l.id),children:[j.jsx("h4",{children:l.title}),j.jsx("p",{children:l.description}),j.jsxs("div",{className:"topic-meta",children:[j.jsx("span",{className:`difficulty difficulty-${l.difficulty}`,children:l.difficulty==="beginner"?"入门":l.difficulty==="intermediate"?"进阶":"高级"}),j.jsx("div",{className:"tags",children:l.tags.slice(0,3).map(o=>j.jsx("span",{className:"tag",children:o},o))})]})]},l.id))})]},r)})]})}const _c=(e,n,t)=>{const r=e[n];return r?typeof r=="function"?r():Promise.resolve(r):new Promise((i,l)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(l.bind(null,new Error("Unknown variable dynamic import: "+n+(n.split("/").length!==t?". Note that variables only represent file names one level deep.":""))))})};function $p({topicId:e,onBack:n}){const[t,r]=Le.useState("article"),i=te.get(e);if(!i)return j.jsxs("div",{className:"topic-not-found",children:[j.jsx("h2",{children:"主题未找到"}),j.jsx("button",{className:"btn btn-primary",onClick:n,children:"返回"})]});const l=Le.lazy(()=>_c(Object.assign({"../topics/array/visualization.tsx":()=>x(()=>import("./visualization-vTXhTB4j.js"),[]),"../topics/binary-search/visualization.tsx":()=>x(()=>import("./visualization-BAdCgguE.js"),[]),"../topics/binary-tree/visualization.tsx":()=>x(()=>import("./visualization-B0NalIfN.js"),[]),"../topics/dynamic-programming/visualization.tsx":()=>x(()=>import("./visualization-DJSDNJBG.js"),[]),"../topics/graph/visualization.tsx":()=>x(()=>import("./visualization-CYYLyzi5.js"),[]),"../topics/hash-table/visualization.tsx":()=>x(()=>import("./visualization-ByTeG1it.js"),[]),"../topics/heap/visualization.tsx":()=>x(()=>import("./visualization-50UDHDzC.js"),[]),"../topics/linked-list/visualization.tsx":()=>x(()=>import("./visualization-Dk0AD_RE.js"),[]),"../topics/queue/visualization.tsx":()=>x(()=>import("./visualization-BCUK9QDK.js"),[]),"../topics/recursion/visualization.tsx":()=>x(()=>import("./visualization-BzmLRmxW.js"),[]),"../topics/shortest-path/visualization.tsx":()=>x(()=>import("./visualization-5zwzeXxD.js"),[]),"../topics/sorting/visualization.tsx":()=>x(()=>import("./visualization-CIT7IuKM.js"),[]),"../topics/stack/visualization.tsx":()=>x(()=>import("./visualization-DYfCf7E_.js"),[]),"../topics/string-matching/visualization.tsx":()=>x(()=>import("./visualization-CXdBfHuc.js"),[]),"../topics/union-find/visualization.tsx":()=>x(()=>import("./visualization-3Oi8V7VA.js"),[])}),`../topics/${e}/visualization.tsx`,4).then(o=>({default:o.default})));return j.jsxs("div",{className:"topic-view",children:[j.jsxs("div",{className:"topic-header",children:[j.jsx("button",{className:"btn btn-secondary",onClick:n,children:"← 返回"}),j.jsx("h2",{children:i.metadata.title}),j.jsx("span",{className:`difficulty difficulty-${i.metadata.difficulty}`,children:i.metadata.difficulty==="beginner"?"入门":i.metadata.difficulty==="intermediate"?"进阶":"高级"})]}),j.jsx("nav",{className:"topic-tabs",children:["article","visualization","demo","quiz"].map(o=>j.jsx("button",{className:`tab ${t===o?"active":""}`,onClick:()=>r(o),children:o==="article"?"文章":o==="visualization"?"可视化":o==="demo"?"演示":"测验"},o))}),j.jsx("div",{className:"topic-content",children:j.jsxs(Le.Suspense,{fallback:j.jsx("div",{children:"加载中..."}),children:[t==="article"&&j.jsx("div",{className:"article-content",dangerouslySetInnerHTML:{__html:i.articleHtml}}),t==="visualization"&&j.jsx(l,{}),t==="demo"&&j.jsx(Ep,{topicId:e}),t==="quiz"&&j.jsx(Pp,{quiz:i.quiz})]})})]})}function Ep({topicId:e}){const[n,t]=Le.useState(""),r=async()=>{try{const l=(await _c(Object.assign({"../topics/array/demo.ts":()=>x(()=>import("./demo-B2h8XQOi.js"),[]),"../topics/binary-search/demo.ts":()=>x(()=>import("./demo-BsMcHisJ.js"),[]),"../topics/binary-tree/demo.ts":()=>x(()=>import("./demo-CX7zhRsJ.js"),[]),"../topics/dynamic-programming/demo.ts":()=>x(()=>import("./demo-Cez5WkxR.js"),[]),"../topics/graph/demo.ts":()=>x(()=>import("./demo-BKamEu9C.js"),[]),"../topics/hash-table/demo.ts":()=>x(()=>import("./demo-DELy2FOv.js"),[]),"../topics/heap/demo.ts":()=>x(()=>import("./demo-C_6a2CxX.js"),[]),"../topics/linked-list/demo.ts":()=>x(()=>import("./demo-DNtA8sPk.js"),[]),"../topics/queue/demo.ts":()=>x(()=>import("./demo-CVrwIivv.js"),[]),"../topics/recursion/demo.ts":()=>x(()=>import("./demo-BhRU7ONa.js"),[]),"../topics/shortest-path/demo.ts":()=>x(()=>import("./demo-BNyj1xnf.js"),[]),"../topics/sorting/demo.ts":()=>x(()=>import("./demo-bt8YQMyc.js"),[]),"../topics/stack/demo.ts":()=>x(()=>import("./demo-Btz2Ok4J.js"),[]),"../topics/string-matching/demo.ts":()=>x(()=>import("./demo-BEI4AeHp.js"),[]),"../topics/union-find/demo.ts":()=>x(()=>import("./demo-CHRt_afW.js"),[])}),`../topics/${e}/demo.ts`,4)).default();t(l)}catch{t("演示加载失败")}};return j.jsxs("div",{className:"demo-section",children:[j.jsx("button",{className:"btn btn-primary",onClick:r,children:"运行演示"}),j.jsx("pre",{className:"demo-output",children:n||"点击按钮运行演示"})]})}function Pp({quiz:e}){const[n,t]=Le.useState(0),[r,i]=Le.useState(null),[l,o]=Le.useState(!1),u=e[n];return j.jsxs("div",{className:"quiz-section",children:[j.jsxs("div",{className:"quiz-progress",children:["第 ",n+1," / ",e.length," 题"]}),j.jsx("h3",{children:u.question}),j.jsx("div",{className:"quiz-options",children:u.options.map((s,c)=>j.jsx("button",{className:`quiz-option ${r===c?c===u.answer?"correct":"wrong":""} ${l&&c===u.answer?"correct":""}`,onClick:()=>{i(c),o(!0)},disabled:l,children:s},c))}),l&&j.jsxs("div",{className:"quiz-explanation",children:[j.jsxs("p",{children:[j.jsx("strong",{children:"解析："}),u.explanation]}),j.jsx("button",{className:"btn btn-primary",onClick:()=>{t(s=>s+1),i(null),o(!1)},disabled:n>=e.length-1,children:"下一题"})]})]})}function jp(){const[e,n]=Le.useState(null);return j.jsxs("div",{className:"app",children:[j.jsxs("header",{className:"app-header",children:[j.jsx("h1",{children:"数据结构与算法 - 可视化知识库"}),j.jsx("p",{children:"交互式学习数据结构与算法"})]}),j.jsx("main",{className:"app-main",children:e?j.jsx($p,{topicId:e,onBack:()=>n(null)}):j.jsx(xp,{onSelect:n})})]})}const Cp="linked-list",Tp="链表",Dp="通过指针连接的动态线性结构，插入删除高效",Ap="基础线性结构",Lp="beginner",zp=["线性结构","动态分配","指针"],Np=2,Qu={id:Cp,title:Tp,description:Dp,category:Ap,difficulty:Lp,tags:zp,order:Np},Fp=[{question:"在单链表中，在已知节点位置的情况下，插入一个新节点的时间复杂度是多少？",options:["O(1)","O(log n)","O(n)","O(n²)"],answer:0,explanation:"在已知节点位置的情况下，插入操作只需要修改指针指向，不需要遍历链表，因此时间复杂度为 O(1)。但如果需要先查找位置，则总时间复杂度为 O(n)。"},{question:"链表与数组相比，以下哪项是链表的优势？",options:["支持随机访问","插入删除不需要移动元素","占用更少的内存空间","缓存命中率更高"],answer:1,explanation:"链表的插入删除操作只需要修改指针指向，不需要像数组那样移动大量元素。数组支持随机访问（O(1)），而链表需要顺序访问（O(n)）。链表每个节点需要额外存储指针，占用更多内存，且节点在内存中不连续，缓存命中率较低。"},{question:"在单链表中，删除一个节点需要什么条件？",options:["只需要知道要删除的节点","需要知道要删除的节点的前一个节点","需要知道头节点","需要知道尾节点"],answer:1,explanation:"在单链表中，删除节点需要修改前一个节点的 next 指针，使其指向被删除节点的下一个节点。因此需要知道被删除节点的前一个节点（前驱节点）。如果只有对被删除节点的引用，无法完成删除操作（除非复制下一个节点的数据并删除下一个节点）。"},{question:"以下哪种情况是链表操作中的常见边界情况？",options:["链表只有一个节点时删除该节点","在非空链表中间插入节点","遍历非空链表","访问链表的第二个节点"],answer:0,explanation:"当链表只有一个节点时删除该节点，需要特别处理：删除后链表变为空，头指针需要设置为 null。这是常见的边界情况，如果处理不当会导致空指针异常或内存泄漏。"},{question:"双向链表相比单向链表的主要优势是什么？",options:["占用更少的内存","可以双向遍历","插入操作更简单","不需要处理空指针"],answer:1,explanation:"双向链表的主要优势是可以双向遍历：既可以从前向后遍历，也可以从后向前遍历。这使得某些操作（如删除给定节点、反向遍历）更加方便。缺点是每个节点需要额外存储一个指针，占用更多内存。双向链表仍然需要处理空指针，插入操作的复杂度与单链表相同。"}],Mp=`# 链表 (Linked List)

## 概念解释

链表是一种**线性数据结构**，其中元素（称为**节点**）不必存储在连续的内存空间中。每个节点包含两部分：

- **数据域**：存储实际数据
- **指针域**：存储指向下一个节点的地址

### 基本术语

| 术语 | 说明 |
|------|------|
| 节点 (Node) | 链表的基本单元，包含数据和指针 |
| 头指针 (Head) | 指向第一个节点的指针 |
| 尾指针 (Tail) | 指向最后一个节点的指针（可选） |
| 空指针 (Null) | 表示链表的结束 |

### 单链表 vs 双链表

**单链表 (Singly Linked List)**：
- 每个节点只有一个指向下一节点的指针
- 只能单向遍历
- 节省内存空间

\`\`\`
[数据|next] -> [数据|next] -> [数据|next] -> null
\`\`\`

**双链表 (Doubly Linked List)**：
- 每个节点有两个指针：\`prev\` 和 \`next\`
- 可以双向遍历
- 插入删除更方便，但占用更多内存

\`\`\`
null <- [prev|数据|next] <-> [prev|数据|next] <-> [prev|数据|next] -> null
\`\`\`

## 为什么重要

链表在计算机科学中具有重要地位：

1. **动态大小**：不需要预先分配固定大小的内存，可以随时增加或减少节点
2. **高效插入删除**：在已知位置的情况下，插入和删除操作的时间复杂度为 O(1)
3. **基础数据结构**：栈、队列等抽象数据类型可以用链表实现
4. **内存灵活**：不要求连续内存空间，适合内存碎片化的场景

## 核心原理

### 节点结构

\`\`\`typescript
class ListNode<T> {
  data: T
  next: ListNode<T> | null

  constructor(data: T) {
    this.data = data
    this.next = null
  }
}
\`\`\`

### 链表操作

#### 1. 遍历 (Traversal)

从头节点开始，沿着 \`next\` 指针逐个访问节点：

\`\`\`typescript
function traverse(head: ListNode<any> | null): void {
  let current = head
  while (current !== null) {
    console.log(current.data)
    current = current.next
  }
}
\`\`\`

**时间复杂度**：O(n)

#### 2. 头部插入 (Insert at Head)

在链表开头添加新节点，新节点成为新的头节点：

\`\`\`typescript
function insertAtHead(head: ListNode<T>, data: T): ListNode<T> {
  const newNode = new ListNode(data)
  newNode.next = head  // 新节点指向原头节点
  return newNode       // 新节点成为新头节点
}
\`\`\`

**时间复杂度**：O(1)

#### 3. 尾部插入 (Insert at Tail)

在链表末尾添加新节点：

\`\`\`typescript
function insertAtTail(head: ListNode<T>, data: T): ListNode<T> {
  const newNode = new ListNode(data)
  if (head === null) return newNode

  let current = head
  while (current.next !== null) {
    current = current.next
  }
  current.next = newNode
  return head
}
\`\`\`

**时间复杂度**：O(n)，需要遍历到末尾

#### 4. 指定位置插入 (Insert at Position)

在指定位置插入新节点：

\`\`\`typescript
function insertAtPosition(head: ListNode<T>, data: T, position: number): ListNode<T> {
  if (position === 0) return insertAtHead(head, data)

  const newNode = new ListNode(data)
  let current = head
  for (let i = 0; i < position - 1 && current !== null; i++) {
    current = current.next
  }

  if (current === null) return head

  newNode.next = current.next
  current.next = newNode
  return head
}
\`\`\`

**时间复杂度**：O(n)

#### 5. 删除节点 (Delete Node)

删除指定节点：

\`\`\`typescript
function deleteNode(head: ListNode<T>, target: T): ListNode<T> | null {
  if (head === null) return null

  // 如果要删除的是头节点
  if (head.data === target) return head.next

  let current = head
  while (current.next !== null && current.next.data !== target) {
    current = current.next
  }

  if (current.next !== null) {
    current.next = current.next.next
  }

  return head
}
\`\`\`

**时间复杂度**：O(n)

#### 6. 搜索 (Search)

查找指定值的节点：

\`\`\`typescript
function search(head: ListNode<T>, target: T): ListNode<T> | null {
  let current = head
  while (current !== null) {
    if (current.data === target) return current
    current = current.next
  }
  return null
}
\`\`\`

**时间复杂度**：O(n)

### 时间复杂度总结

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| 头部插入 | O(1) | 直接修改头指针 |
| 尾部插入 | O(n) | 需要遍历到末尾 |
| 指定位置插入 | O(n) | 需要遍历到指定位置 |
| 删除节点 | O(n) | 需要先找到节点 |
| 搜索 | O(n) | 需要遍历整个链表 |
| 访问第i个元素 | O(n) | 不能随机访问 |

## 可视化说明

在可视化界面中，链表通常表示为：

\`\`\`
┌─────┬─────┐    ┌─────┬─────┐    ┌─────┬─────┐
│  A  │  ───┼───>│  B  │  ───┼───>│  C  │ null│
└─────┴─────┘    └─────┴─────┘    └─────┴─────┘
\`\`\`

- **方框**表示节点
- **箭头**表示指针关系
- **null**表示链表结束

通过可视化可以直观地观察：
- 插入操作如何改变指针指向
- 删除操作如何"跳过"被删除节点
- 遍历过程如何逐个访问节点

## 常见错误

### 1. 空指针异常 (Null Pointer Exception)

\`\`\`typescript
// 错误：没有检查链表是否为空
function getFirst(head: ListNode<T>): T {
  return head.data  // 如果 head 为 null，会报错
}

// 正确：先检查是否为空
function getFirst(head: ListNode<T> | null): T | null {
  if (head === null) return null
  return head.data
}
\`\`\`

### 2. 丢失头节点引用

\`\`\`typescript
// 错误：在遍历时修改了头节点
function badDelete(head: ListNode<T>): void {
  head = head.next  // 只修改了局部变量，不影响外部
}

// 正确：返回新的头节点
function goodDelete(head: ListNode<T>): ListNode<T> | null {
  return head.next
}
\`\`\`

### 3. 循环链表检测

如果链表中存在环，遍历会陷入无限循环。使用**快慢指针法**检测：

\`\`\`typescript
function hasCycle(head: ListNode<T>): boolean {
  let slow = head
  let fast = head

  while (fast !== null && fast.next !== null) {
    slow = slow.next        // 慢指针每次走一步
    fast = fast.next.next   // 快指针每次走两步
    if (slow === fast) return true
  }

  return false
}
\`\`\`

## 实际应用

### 1. LRU 缓存 (Least Recently Used Cache)

LRU 缓存使用**双向链表 + 哈希表**实现：
- 哈希表提供 O(1) 的查找
- 双向链表维护访问顺序
- 最近访问的节点移到链表头部
- 缓存满时删除链表尾部节点

### 2. 撤销功能 (Undo Functionality)

文本编辑器的撤销功能可以用链表实现：
- 每次操作作为一个节点
- 新操作添加到链表头部
- 撤销时移动到上一个节点
- 重做时移动到下一个节点

### 3. 音乐播放列表

音乐播放器的播放列表可以使用循环链表：
- 每首歌是一个节点
- 循环链表实现"循环播放"
- 双向链表支持"上一首"和"下一首"

### 4. 操作系统任务调度

操作系统使用链表管理进程：
- 就绪队列、等待队列都是链表
- 进程状态改变时，在链表间移动节点

## 总结

链表是一种基础而重要的数据结构：

**优点**：
- 动态大小，无需预先分配内存
- 在已知位置的插入删除操作高效 O(1)
- 不要求连续内存空间
- 可以方便地实现栈、队列等数据结构

**缺点**：
- 不能随机访问，访问第 i 个元素需要 O(n)
- 每个节点需要额外的指针空间
- 缓存不友好（节点在内存中不连续）

**适用场景**：
- 频繁插入删除的场景
- 无法预知数据量大小的场景
- 需要实现栈、队列等抽象数据类型
- LRU 缓存、撤销功能等特定应用

理解链表是学习更复杂数据结构（如树、图）的基础，因为这些结构本质上都是节点和指针的组合。
`,Yu={...Qu,difficulty:Qu.difficulty},Rp=Fp;function Bp(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(o=>o.trim());if(i.every(o=>/^[-:]+$/.test(o)))return"<!-- table separator -->";const l="td";return`<tr>${i.map(o=>`<${l}>${o}</${l}>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(Yu.id,{metadata:Yu,articleHtml:Bp(Mp),quiz:Rp,getVisualization:()=>x(()=>import("./visualization-Dk0AD_RE.js"),[]),getDemo:()=>x(()=>import("./demo-DNtA8sPk.js"),[])});const Ip="stack",Vp="栈",Hp="后进先出(LIFO)的线性结构，函数调用和表达式求值的基础",Wp="基础线性结构",Up="beginner",qp=["LIFO","线性结构","递归"],Kp=3,Qp={id:Ip,title:Vp,description:Hp,category:Wp,difficulty:Up,tags:qp,order:Kp},Yp=[{question:"栈的基本原则是什么？",options:["先进先出 (FIFO)","后进先出 (LIFO)","随机访问","优先级排序"],answer:1,explanation:"栈是一种后进先出(LIFO, Last In First Out)的线性数据结构。最后被压入栈的元素最先被弹出，就像一摞盘子，只能从最上面取。"},{question:"依次将元素 1, 2, 3, 4 压入栈，然后执行两次弹出操作，弹出的元素依次是？",options:["1, 2","3, 4","4, 3","2, 1"],answer:2,explanation:"按照LIFO原则，最后压入的4最先弹出，然后是3。栈的操作序列：push(1), push(2), push(3), push(4), pop()→4, pop()→3。"},{question:"以下哪个不是栈的典型应用场景？",options:["函数调用管理","括号匹配检查","任务调度队列","浏览器的后退功能"],answer:2,explanation:"任务调度队列通常使用队列(Queue)实现，遵循先进先出原则。而函数调用、括号匹配、浏览器后退都是栈的经典应用，因为它们都需要后进先出的特性。"},{question:"基于数组实现栈与基于链表实现栈的主要区别是什么？",options:["数组实现更节省内存","链表实现不支持peek操作","数组实现有固定容量限制，链表实现动态扩展","链表实现的push操作更慢"],answer:2,explanation:"基于数组的栈在创建时需要指定大小，容量固定；而基于链表的栈可以动态增长，不受预设容量限制。不过数组实现的缓存局部性更好，实际性能可能更优。"},{question:'使用栈计算后缀表达式 "3 4 + 2 *" 的结果是？',options:["11","14","10","20"],answer:1,explanation:"后缀表达式求值过程：遇到数字入栈，遇到运算符弹出两个操作数计算后入栈。①3入栈 ②4入栈 ③遇到+，弹出4和3，计算3+4=7入栈 ④2入栈 ⑤遇到*，弹出2和7，计算7*2=14入栈。最终结果14。"}],Xp=Qp,Gp=Yp;function Jp(e){let n=e;n=n.replace(/^### (.+)$/gm,"<h3>$1</h3>"),n=n.replace(/^## (.+)$/gm,"<h2>$1</h2>"),n=n.replace(/^# (.+)$/gm,"<h1>$1</h1>"),n=n.replace(/```(\w*)\n([\s\S]*?)```/g,(l,o,u)=>{const s=u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<pre><code class="language-${o}">${s}</code></pre>`}),n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),n=n.replace(/\*([^*]+)\*/g,"<em>$1</em>"),n=n.replace(/^\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/gm,(l,o,u)=>{const s=o.split("|").map(p=>p.trim()).filter(p=>p),c=u.trim().split(`
`).map(p=>p.split("|").map(m=>m.trim()).filter(m=>m));let h=`<table>
<thead><tr>`;return s.forEach(p=>{h+=`<th>${p}</th>`}),h+=`</tr></thead>
<tbody>`,c.forEach(p=>{h+="<tr>",p.forEach(m=>{h+=`<td>${m}</td>`}),h+="</tr>"}),h+=`</tbody>
</table>`,h}),n=n.replace(/^- (.+)$/gm,"<li>$1</li>"),n=n.replace(/((?:<li>.*<\/li>\n?)+)/g,"<ul>$1</ul>"),n=n.replace(/^\d+\. (.+)$/gm,"<li>$1</li>");const t=n.split(`
`),r=[];let i=!1;for(const l of t){const o=l.trim();o.startsWith("<h")||o.startsWith("<pre")||o.startsWith("<ul")||o.startsWith("<ol")||o.startsWith("<table")||o.startsWith("<thead")||o.startsWith("<tbody")||o.startsWith("<tr")||o.startsWith("</")||o.startsWith("<li")?(r.push(l),o.startsWith("<pre")&&(i=!0),o.startsWith("</pre>")&&(i=!1)):o===""?r.push(""):i?r.push(l):r.push(`<p>${o}</p>`)}return r.join(`
`)}const bp=`# 栈 (Stack)

## 概念解释

栈是一种遵循**后进先出**（LIFO, Last In First Out）原则的线性数据结构。想象一摞叠放的盘子：你只能从最顶部拿起盘子（弹出），也只能把新盘子放在最顶部（压入）。

栈只允许在一端（称为**栈顶**）进行插入和删除操作，另一端称为**栈底**。栈底是固定的，最先放入的元素位于栈底。

### 核心操作

- **push（压栈）**：将一个元素添加到栈顶。时间复杂度 O(1)
- **pop（弹栈）**：移除并返回栈顶元素。时间复杂度 O(1)
- **peek / top（查看栈顶）**：返回栈顶元素但不移除。时间复杂度 O(1)
- **isEmpty（判空）**：检查栈是否为空。时间复杂度 O(1)

所有操作都在栈顶进行，因此每个操作的时间复杂度都是 O(1)。

## 为什么重要

栈虽然结构简单，但它是计算机科学中最基础、最重要的数据结构之一：

### 函数调用栈

每次调用函数时，系统会将函数的返回地址、局部变量等信息压入**调用栈**（Call Stack）。函数返回时，这些信息从栈中弹出。这就是为什么递归能够工作的基础——每次递归调用都创建一个新的栈帧。

### 表达式求值

编译器使用栈来计算数学表达式。中缀表达式（如 3 + 4 * 2）通过栈转换为后缀表达式，再用栈进行求值。

### 回溯算法

在迷宫求解、八皇后等问题中，栈用于记录已走过的路径。当遇到死胡同时，回退到上一个分叉点重新选择。

### 深度优先搜索 (DFS)

图和树的深度优先搜索本质上就是栈操作的递归版本，也可以用显式栈来实现非递归版本。

## 核心原理

### 基于数组的实现

数组实现使用动态数组存储元素，push 在尾部添加，pop 从尾部移除。

**优点**：内存连续，缓存友好，实现简单。
**缺点**：需要预设大小（静态数组）或可能浪费内存（动态数组扩容）。

### 基于链表的实现

链表实现在头部插入和删除节点，每个节点包含数据和指向下一个节点的指针。

**优点**：动态大小，不需要预设容量。
**缺点**：每个节点需要额外的指针空间，内存不连续。

### 两种实现的比较

| 特性 | 数组实现 | 链表实现 |
|------|---------|---------|
| 内存分配 | 连续 | 分散 |
| 容量 | 固定/需扩容 | 动态 |
| 缓存性能 | 好 | 较差 |
| 额外开销 | 无 | 每节点一个指针 |
| push/pop | O(1) 均摊 | O(1) |

## 可视化说明

在可视化演示中，栈被表示为一个垂直的容器：

- **栈底**在下方，**栈顶**在上方
- **压入操作**：新元素从顶部滑入
- **弹出操作**：顶部元素滑出
- **查看栈顶**：顶部元素高亮显示

每个操作都有动画效果，帮助你直观理解栈的工作方式。

## 常见错误

### 栈溢出 (Stack Overflow)

当栈已满时继续压入元素就会发生栈溢出。在基于数组的固定大小栈中，这是一个真实的问题。在递归中，过深的递归调用也会耗尽调用栈空间。

### 空栈弹出

对空栈执行 pop 或 peek 操作是常见的边界错误。始终在操作前检查栈是否为空。

### 混淆栈和队列

初学者容易混淆栈（LIFO）和队列（FIFO）的特性。记住：栈像一摞盘子，队列像排队买票。

## 实际应用

### 撤销/重做 (Undo/Redo)

文字编辑器使用两个栈实现撤销重做功能：撤销栈记录操作，执行撤销时将操作移入重做栈。

### 浏览器历史记录

浏览器的"后退"按钮使用栈来记录访问过的页面。每次访问新页面，当前页面被压入栈。

### 括号匹配

检查括号是否匹配是栈的经典应用。遇到左括号入栈，遇到右括号时检查栈顶是否匹配。

### 后缀表达式求值

后缀表达式（逆波兰表示法）不需要括号，用栈可以优雅地求值。遇到数字入栈，遇到运算符弹出两个操作数计算后入栈。

## 总结

栈是一种简单但强大的数据结构，遵循后进先出(LIFO)原则。它的所有核心操作（push、pop、peek）都是 O(1) 时间复杂度。

栈的关键特性：
- **操作受限**：只能在栈顶进行插入和删除
- **高效**：所有基本操作都是常数时间
- **用途广泛**：从函数调用到表达式求值，从撤销功能到括号匹配

理解栈是理解更复杂数据结构和算法的基础。递归、深度优先搜索、动态规划等高级概念都与栈密切相关。`,Zp=Jp(bp);te.register("stack",{metadata:Xp,articleHtml:Zp,quiz:Gp,getVisualization:()=>x(()=>import("./visualization-DYfCf7E_.js"),[]),getDemo:()=>x(()=>import("./demo-Btz2Ok4J.js"),[])});const em="binary-tree",nm="二叉树",tm="每个节点最多两个子节点的树形结构，搜索和排序的基石",rm="树形结构",im="intermediate",lm=["树形结构","递归","遍历"],om=5,um={id:em,title:nm,description:tm,category:rm,difficulty:im,tags:lm,order:om},sm=[{question:"一棵高度为 h 的满二叉树有多少个节点？",options:["2h","2^h - 1","2^(h-1)","h^2"],answer:1,explanation:"满二叉树每层节点数依次为 1, 2, 4, 8, ..., 2^(h-1)，总和为 2^h - 1。例如高度为 3 的满二叉树有 1+2+4=7 个节点。"},{question:"对二叉树进行中序遍历（Inorder）的顺序是？",options:["根 -> 左 -> 右","左 -> 根 -> 右","左 -> 右 -> 根","按层从上到下"],answer:1,explanation:"中序遍历的顺序是：先遍历左子树，再访问根节点，最后遍历右子树。对于二叉搜索树，中序遍历会得到升序序列。"},{question:"以下关于完全二叉树的说法，哪个是正确的？",options:["所有叶子节点都在同一层","除了最后一层外，其他层都是满的，且最后一层的节点从左到右连续排列","每个节点都恰好有两个子节点","任意节点的左右子树高度差不超过 1"],answer:1,explanation:"完全二叉树的定义是：除了最后一层外，每一层都是满的，且最后一层的节点从左到右连续排列。注意与满二叉树（所有层都满）和平衡二叉树（高度差不超过 1）的区别。"},{question:"二叉搜索树（BST）的核心性质是？",options:["每个节点最多有两个子节点","左子树所有节点值 < 根节点值 < 右子树所有节点值","树的高度总是 log n","所有叶子节点在同一层"],answer:1,explanation:"二叉搜索树的核心性质是：对于任意节点，其左子树中所有节点的值都小于该节点的值，右子树中所有节点的值都大于该节点的值。这使得查找、插入、删除的平均时间复杂度为 O(log n)。"},{question:"使用递归遍历二叉树时，最常见的错误是什么？",options:["忘记处理叶子节点","没有正确处理空节点（null）的基准情况","递归深度太深","遍历顺序写反"],answer:1,explanation:"递归遍历二叉树时，最常见的错误是忘记处理空节点（null）的基准情况（base case）。如果没有检查节点是否为空就直接访问其属性，会导致 NullPointerException 或类似错误。正确的做法是在递归函数开头先检查当前节点是否为 null。"}],am=`# 二叉树 (Binary Tree)

## 概念解释

二叉树是一种树形数据结构，其中每个节点最多有两个子节点，分别称为**左子节点**和**右子节点**。它是计算机科学中最基本且最重要的数据结构之一。

### 核心术语

- **根节点 (Root)**：树的顶层节点，没有父节点。它是整棵树的起点。
- **叶子节点 (Leaf)**：没有子节点的节点，位于树的"末端"。
- **高度 (Height)**：从根节点到最远叶子节点的最长路径上的边数。空树的高度通常定义为 -1 或 0。
- **深度 (Depth)**：从根节点到指定节点的路径上的边数。根节点的深度为 0。
- **度 (Degree)**：一个节点拥有的子节点数量。在二叉树中，每个节点的度最大为 2。

### 二叉树的类型

**满二叉树 (Full Binary Tree)**：每个节点要么有 0 个子节点，要么有 2 个子节点。没有节点只有 1 个子节点。

**完全二叉树 (Complete Binary Tree)**：除了最后一层外，每一层都是满的，且最后一层的节点从左到右连续排列。堆（Heap）就是基于完全二叉树实现的。

**完美二叉树 (Perfect Binary Tree)**：所有内部节点都有两个子节点，且所有叶子节点都在同一层。高度为 h 的完美二叉树恰好有 2^(h+1) - 1 个节点。

**平衡二叉树 (Balanced Binary Tree)**：任意节点的左右子树高度差不超过 1。AVL 树和红黑树都是平衡二叉树的实现。

## 为什么重要

二叉树在计算机科学中无处不在，它是许多高级数据结构和算法的基础：

- **二叉搜索树 (BST)**：支持 O(log n) 平均时间复杂度的查找、插入和删除操作，是数据库索引的基础。
- **堆 (Heap)**：基于完全二叉树实现，用于优先队列，支持 O(log n) 的插入和 O(1) 的获取最大/最小值。
- **表达式树 (Expression Tree)**：用于编译器中表示和计算数学表达式。
- **文件系统**：目录结构本质上是一棵树，文件路径的解析依赖树的遍历。
- **决策树**：在机器学习中用于分类和回归任务。
- **哈夫曼编码**：用于数据压缩，通过构建最优前缀编码树来实现。

## 核心原理

### 节点结构

二叉树的每个节点包含三个部分：

\`\`\`typescript
class TreeNode {
  value: number       // 节点存储的值
  left: TreeNode | null   // 指向左子节点的引用
  right: TreeNode | null  // 指向右子节点的引用

  constructor(value: number) {
    this.value = value
    this.left = null
    this.right = null
  }
}
\`\`\`

### 递归定义

二叉树本身就是递归定义的：一棵二叉树要么是空的，要么由一个根节点和两棵互不相交的左子树和右子树组成，而这两棵子树本身也是二叉树。这种递归性质使得许多树的操作可以用简洁的递归代码实现。

### 四种遍历方式

**前序遍历 (Preorder)**：根 -> 左 -> 右
- 访问根节点，递归遍历左子树，递归遍历右子树
- 应用：复制树的结构、前缀表达式

**中序遍历 (Inorder)**：左 -> 根 -> 右
- 递归遍历左子树，访问根节点，递归遍历右子树
- 应用：BST 的升序输出、中缀表达式

**后序遍历 (Postorder)**：左 -> 右 -> 根
- 递归遍历左子树，递归遍历右子树，访问根节点
- 应用：计算目录大小、释放树的内存、后缀表达式

**层序遍历 (Level-order)**：逐层从左到右
- 使用队列，从根节点开始，依次将每层的节点从左到右入队
- 应用：按层打印、最短路径问题

## 可视化说明

在可视化界面中，你可以：

1. **观察树的结构**：节点以树形布局展示，父子关系通过连线表示。
2. **动画遍历**：选择不同的遍历方式，观察节点被访问的顺序。当前访问的节点会被高亮显示。
3. **插入节点**：在二叉搜索树中插入新值，观察树结构的变化。
4. **搜索操作**：在 BST 中搜索指定值，观察搜索路径。

## 常见错误

1. **混淆高度和深度**：高度是从节点到最远叶子的距离（自底向上），深度是从根到节点的距离（自顶向下）。根节点的深度为 0，叶子节点的高度为 0。

2. **递归时忘记处理空节点**：这是最常见也是最危险的错误。在递归遍历二叉树时，必须先检查当前节点是否为 null，否则会导致程序崩溃。

\`\`\`typescript
// 错误示例
function traverse(node: TreeNode) {
  console.log(node.value)  // 如果 node 为 null 会报错！
  traverse(node.left)
  traverse(node.right)
}

// 正确示例
function traverse(node: TreeNode | null) {
  if (node === null) return  // 基准情况：空节点直接返回
  console.log(node.value)
  traverse(node.left)
  traverse(node.right)
}
\`\`\`

3. **不平衡导致性能退化**：普通的二叉搜索树在最坏情况下（如依次插入有序数据）会退化为链表，查找时间复杂度从 O(log n) 退化为 O(n)。解决方案是使用自平衡二叉树（如 AVL 树、红黑树）。

4. **忽略递归的基准情况**：每个递归函数都必须有明确的终止条件，否则会导致栈溢出。

## 实际应用

- **数据库索引**：B 树和 B+ 树是数据库索引的核心数据结构，它们是二叉树的多路推广。
- **文件系统**：目录和文件的层次结构用树表示，路径解析就是树的遍历。
- **决策树**：机器学习中的分类算法，通过一系列判断条件将数据分类。
- **哈夫曼编码**：数据压缩算法，通过构建最优前缀编码树来最小化编码长度。
- **DOM 树**：网页的文档对象模型本质上是一棵树，JavaScript 操作 DOM 就是在操作树结构。
- **抽象语法树 (AST)**：编译器将源代码解析为树形结构，便于分析和转换。

## 总结

二叉树是数据结构与算法的基石。理解二叉树的关键在于掌握：

1. **递归思维**：二叉树的定义本身就是递归的，大多数树的操作都可以用递归优雅地实现。
2. **四种遍历方式**：前序、中序、后序、层序遍历各有不同的应用场景。
3. **平衡的重要性**：保持树的平衡是保证操作效率的关键。
4. **空节点处理**：递归时必须正确处理空节点的基准情况。

掌握了二叉树，你就为学习更高级的树形结构（如 AVL 树、红黑树、B 树、字典树等）打下了坚实的基础。
`;function cm(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<!--")?r:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"")}const Xu=um;te.register(Xu.id,{metadata:Xu,articleHtml:cm(am),quiz:sm,getVisualization:()=>x(()=>import("./visualization-B0NalIfN.js"),[]),getDemo:()=>x(()=>import("./demo-CX7zhRsJ.js"),[])});const fm="hash-table",dm="哈希表",pm="通过哈希函数实现 O(1) 平均查找的键值对结构",mm="基础线性结构",hm="intermediate",gm=["哈希","键值对","O(1)查找"],ym=6,Gu={id:fm,title:dm,description:pm,category:mm,difficulty:hm,tags:gm,order:ym},vm=[{question:"哈希函数应具备的最重要特性是什么？",options:["输出结果必须是连续整数","相同的输入必须产生相同的输出（确定性）","不同的输入必须产生不同的输出","输出结果必须小于输入值"],answer:1,explanation:"哈希函数必须是确定性的：对于相同的输入 key，必须始终返回相同的哈希值。否则无法正确定位数据存储位置。不同的输入理论上可能产生相同的哈希值（哈希冲突），但好的哈希函数应尽量减少这种情况。"},{question:"在使用链地址法（Chaining）解决冲突的哈希表中，最坏情况下的查找时间复杂度是多少？",options:["O(1)","O(log n)","O(n)","O(n²)"],answer:2,explanation:"在最坏情况下，所有键都映射到同一个桶中，链表退化为长度为 n 的线性表，查找需要遍历整个链表，时间复杂度为 O(n)。但在平均情况下，如果哈希函数分布均匀且负载因子合理，查找时间复杂度为 O(1)。"},{question:"哈希表的负载因子（Load Factor）是指什么？当负载因子过高时应该怎么做？",options:["已存储元素数量 / 桶的数量；应该进行 rehash 扩容","桶的数量 / 已存储元素数量；应该缩小桶的数量","冲突次数 / 已存储元素数量；应该更换哈希函数","已存储元素数量 × 桶的数量；应该增加元素数量"],answer:0,explanation:"负载因子 = 元素数量 / 桶的数量，它反映了哈希表的拥挤程度。当负载因子超过阈值（通常为 0.75）时，冲突概率急剧上升，性能下降。此时应进行 rehash：创建更大的桶数组，将所有元素重新映射到新数组中。"},{question:"开放寻址法（Open Addressing）中的线性探测（Linear Probing）容易导致什么问题？",options:["内存溢出","一次聚集（Primary Clustering）","哈希函数失效","元素丢失"],answer:1,explanation:"线性探测按顺序逐个检查下一个位置，当多个键映射到相邻位置时，会形成连续的「聚集」区域，导致探测路径越来越长，性能下降。这称为一次聚集。二次探测和双重哈希可以缓解此问题。"},{question:"以下哪个场景不适合使用哈希表？",options:["实现字典/映射（Map）数据结构","需要按键的顺序遍历所有元素","缓存系统中快速查找已缓存的数据","检测集合中是否存在重复元素"],answer:1,explanation:"哈希表中的元素是无序存储的，无法保证按键的顺序遍历。如果需要有序遍历，应该使用有序映射（如红黑树实现的 TreeMap）。哈希表非常适合做快速查找、去重和缓存，但不适合需要维护顺序的场景。"}],Ju={...Gu,difficulty:Gu.difficulty},wm=vm;function km(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(o=>o.trim());if(i.every(o=>/^[-:]+$/.test(o)))return"<!-- table separator -->";const l="td";return`<tr>${i.map(o=>`<${l}>${o}</${l}>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}const Sm=`# 哈希表 (Hash Table)

## 概念解释

哈希表（Hash Table），也称为散列表，是一种通过**哈希函数**将键（Key）映射到数组索引，从而实现快速数据存取的数据结构。它是计算机科学中最重要的数据结构之一。

### 核心组件

哈希表由三个核心部分组成：

- **键（Key）**：用于标识数据的唯一标识符，如字符串、数字等
- **哈希函数（Hash Function）**：将任意大小的键转换为固定范围的整数（数组索引）
- **桶数组（Bucket Array）**：存储实际数据的数组，每个位置称为一个"桶"

### 基本术语

| 术语 | 说明 |
|------|------|
| 哈希函数 (Hash Function) | 将键映射为数组索引的函数 |
| 桶 (Bucket) | 哈希表数组中的一个位置 |
| 冲突 (Collision) | 不同的键映射到相同的索引 |
| 负载因子 (Load Factor) | 元素数量 / 桶的数量 |
| 再哈希 (Rehashing) | 扩容后重新计算所有元素的位置 |

### 工作原理示意

\`\`\`
键 "apple" → 哈希函数 → 3 → 桶[3] 存储值
键 "banana" → 哈希函数 → 1 → 桶[1] 存储值
键 "cherry" → 哈希函数 → 3 → 桶[3] (冲突！需要处理)
\`\`\`

## 为什么重要

哈希表在现代编程中无处不在，它的重要性体现在：

1. **O(1) 平均查找**：在理想情况下，插入、查找、删除操作的平均时间复杂度都是 O(1)，这是数组和链表无法比拟的
2. **语言内置支持**：几乎每种编程语言都内置了哈希表实现——Python 的 \`dict\`、Java 的 \`HashMap\`、JavaScript 的 \`Map\` 和 \`Object\`、C++ 的 \`unordered_map\`
3. **通用性强**：可以存储任意类型的键值对，适用于各种场景
4. **工程基石**：数据库索引、缓存系统、编译器符号表等核心组件都依赖哈希表

## 核心原理

### 哈希函数设计

一个好的哈希函数应该具备以下特性：

1. **确定性**：相同的输入始终产生相同的输出
2. **均匀性**：输出应均匀分布在整个范围内，减少冲突
3. **高效性**：计算速度快，不应成为性能瓶颈

\`\`\`typescript
// 简单的字符串哈希函数
function simpleHash(key: string, capacity: number): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i)
  }
  return hash % capacity
}

// 更好的哈希函数（djb2 算法）
function djb2Hash(key: string, capacity: number): number {
  let hash = 5381
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash) % capacity
}
\`\`\`

### 冲突解决

哈希冲突是不可避免的——当两个不同的键映射到同一个桶时，就需要冲突解决策略。

#### 方法一：链地址法 (Chaining)

每个桶维护一个链表，所有映射到该桶的元素都存储在链表中：

\`\`\`
桶[0]: null
桶[1]: [banana:200] -> null
桶[2]: null
桶[3]: [apple:100] -> [cherry:300] -> null
桶[4]: null
桶[5]: null
桶[6]: null
\`\`\`

\`\`\`typescript
class HashTableChaining {
  private buckets: ListNode[][]

  insert(key: string, value: number): void {
    const index = this.hash(key)
    // 检查是否已存在
    for (const node of this.buckets[index]) {
      if (node.key === key) {
        node.value = value  // 更新
        return
      }
    }
    this.buckets[index].push({ key, value })  // 添加到链表
  }
}
\`\`\`

#### 方法二：开放寻址法 (Open Addressing)

当冲突发生时，按照某种探测序列寻找下一个空闲位置：

\`\`\`typescript
// 线性探测：冲突时检查下一个位置
function linearProbe(hash: number, i: number, capacity: number): number {
  return (hash + i) % capacity
}

// 二次探测：冲突时按二次方跳跃
function quadraticProbe(hash: number, i: number, capacity: number): number {
  return (hash + i * i) % capacity
}
\`\`\`

\`\`\`
线性探测过程：
插入 "apple"  → hash=3 → 桶[3] 空 → 放入
插入 "cherry" → hash=3 → 桶[3] 已满 → 检查桶[4] → 空 → 放入
插入 "date"   → hash=4 → 桶[4] 已满 → 检查桶[5] → 空 → 放入
\`\`\`

### 再哈希 (Rehashing)

当负载因子过高时，需要扩容并重新分配所有元素：

\`\`\`typescript
private rehash(): void {
  const oldBuckets = this.buckets
  this.capacity *= 2  // 容量翻倍
  this.buckets = new Array(this.capacity).fill(null)
  this.count = 0

  // 将所有元素重新插入
  for (const bucket of oldBuckets) {
    if (bucket) {
      for (const entry of bucket) {
        this.insert(entry.key, entry.value)
      }
    }
  }
}
\`\`\`

### 时间复杂度

| 操作 | 平均情况 | 最坏情况 | 说明 |
|------|----------|----------|------|
| 插入 | O(1) | O(n) | 最坏情况所有键在同一桶 |
| 查找 | O(1) | O(n) | 需要遍历链表或探测序列 |
| 删除 | O(1) | O(n) | 需要先找到元素 |

## 可视化说明

在可视化界面中，哈希表展示为：

- **上方**：桶数组，每个方框代表一个桶
- **下方**：链表节点，展示冲突时的链地址法
- **高亮**：不同颜色表示当前操作阶段

通过动画可以观察：
- 哈希函数如何将键映射到桶
- 冲突发生时链表如何增长
- 查找过程中如何遍历链表

## 常见错误

### 1. 哈希函数设计不当导致聚集

\`\`\`typescript
// 错误：简单的取模运算，连续键导致聚集
function badHash(key: number, capacity: number): number {
  return key % capacity  // 如果 key 是 10,20,30... 都映射到同一个桶
}

// 正确：使用更好的哈希函数
function goodHash(key: number, capacity: number): number {
  key = ((key >> 16) ^ key) * 0x45d9f3b
  key = ((key >> 16) ^ key) * 0x45d9f3b
  key = (key >> 16) ^ key
  return Math.abs(key) % capacity
}
\`\`\`

### 2. 忘记处理冲突

\`\`\`typescript
// 错误：直接覆盖，丢失已有数据
function badInsert(key: string, value: number): void {
  const index = this.hash(key)
  this.buckets[index] = { key, value }  // 如果桶里已有数据会被覆盖！
}

// 正确：使用链表或探测
function goodInsert(key: string, value: number): void {
  const index = this.hash(key)
  if (!this.buckets[index]) {
    this.buckets[index] = []
  }
  this.buckets[index].push({ key, value })
}
\`\`\`

### 3. 负载因子过高导致性能退化

\`\`\`typescript
// 错误：不检查负载因子
// 当元素数量远大于桶数量时，链表变长，O(1) 退化为 O(n)

// 正确：监控负载因子，及时扩容
if (this.count / this.capacity > 0.75) {
  this.rehash()
}
\`\`\`

## 实际应用

### 1. 数据库索引

数据库使用哈希索引加速等值查询。当执行 \`WHERE id = 12345\` 时，哈希表可以在 O(1) 时间内定位到目标记录。

### 2. 缓存系统

浏览器缓存、CDN、Redis 等都使用哈希表存储已缓存的数据。通过 URL 或键名快速查找缓存内容，避免重复计算或网络请求。

### 3. 编译器符号表

编译器使用哈希表记录变量名、函数名等标识符的信息（类型、作用域、内存地址），在语法分析和代码生成阶段快速查找。

### 4. 去重 (Deduplication)

\`\`\`typescript
function deduplicate(arr: number[]): number[] {
  const seen = new Set<number>()  // Set 底层就是哈希表
  return arr.filter(item => {
    if (seen.has(item)) return false
    seen.add(item)
    return true
  })
}
\`\`\`

### 5. 计数统计

\`\`\`typescript
function countFrequency(arr: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1)
  }
  return freq
}
\`\`\`

### 6. 两数之和问题

\`\`\`typescript
function twoSum(nums: number[], target: number): [number, number] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) {
      return [map.get(complement)!, i]
    }
    map.set(nums[i], i)
  }
  return [-1, -1]
}
\`\`\`

## 总结

哈希表是计算机科学中最实用的数据结构之一：

**核心思想**：通过哈希函数将键映射为数组索引，实现 O(1) 的平均存取。

**优点**：
- 平均 O(1) 的插入、查找、删除
- 实现简单，编程语言内置支持
- 适用范围广泛

**缺点**：
- 最坏情况 O(n)（所有键冲突到同一桶）
- 不支持有序遍历
- 哈希函数设计影响性能

**关键要点**：
- 选择好的哈希函数，保证均匀分布
- 合理设置负载因子阈值（通常 0.75），及时 rehash
- 根据场景选择冲突解决策略：链地址法实现简单，开放寻址缓存友好

理解哈希表是掌握 HashMap、Set、缓存系统等高级数据结构和工程实践的基础。`,_m=km(Sm);te.register(Ju.id,{metadata:Ju,articleHtml:_m,quiz:wm,getVisualization:()=>x(()=>import("./visualization-ByTeG1it.js"),[]),getDemo:()=>x(()=>import("./demo-DELy2FOv.js"),[])});const Om="heap",xm="堆",$m="基于完全二叉树的优先队列实现，支持 O(log n) 插入和 O(1) 取最值",Em="树形结构",Pm="intermediate",jm=["优先队列","完全二叉树","堆排序"],Cm=7,Tm={id:Om,title:xm,description:$m,category:Em,difficulty:Pm,tags:jm,order:Cm},Dm=[{question:"最大堆（Max-Heap）的性质是什么？",options:["父节点的值小于子节点的值","父节点的值大于等于子节点的值","左子节点的值大于右子节点的值","所有叶子节点的值相同"],answer:1,explanation:"最大堆的堆性质是：对于任意节点 i（除了根节点），其父节点的值都大于等于该节点的值。这意味着堆顶（根节点）始终是最大值。最小堆则相反，父节点值小于等于子节点值。"},{question:"在一个用数组表示的堆中，索引为 i 的节点的父节点索引是多少？",options:["i * 2","i * 2 + 1","Math.floor((i - 1) / 2)","Math.floor(i / 2)"],answer:2,explanation:"在数组表示的堆中（索引从 0 开始），对于索引为 i 的节点：父节点索引为 Math.floor((i-1)/2)，左子节点索引为 2*i+1，右子节点索引为 2*i+2。如果索引从 1 开始，则父节点为 Math.floor(i/2)，左子节点为 2*i，右子节点为 2*i+1。"},{question:"将一个包含 n 个元素的无序数组构建成堆的时间复杂度是多少？",options:["O(n log n)","O(n)","O(log n)","O(n^2)"],answer:1,explanation:"建堆（Heapify）的时间复杂度是 O(n)，而非 O(n log n)。这是因为从最后一个非叶子节点开始自底向上进行下沉操作，虽然每个节点的下沉代价是 O(h)，但大部分节点都在底层（h 很小），通过数学求和可以证明总代价为 O(n)。"},{question:"堆排序（Heap Sort）的时间复杂度和空间复杂度分别是？",options:["时间 O(n log n)，空间 O(n)","时间 O(n log n)，空间 O(1)","时间 O(n^2)，空间 O(1)","时间 O(n)，空间 O(n)"],answer:1,explanation:"堆排序分为两步：1) 建堆 O(n)；2) 依次取出堆顶并调整堆，共 n-1 次下沉操作，每次 O(log n)，总计 O(n log n)。总体时间复杂度为 O(n log n)。由于堆排序是原地排序，只需要常数级别的额外空间，空间复杂度为 O(1)。"},{question:"以下哪个场景最适合使用堆（优先队列）来解决？",options:["在已排序数组中查找元素","合并 K 个有序链表","判断括号是否匹配","实现 LRU 缓存"],answer:1,explanation:"合并 K 个有序链表是堆的经典应用。使用一个最小堆维护 K 个链表的当前头节点，每次取出最小值并将其下一个节点加入堆，时间复杂度为 O(N log K)。其他选项中，查找用二分搜索，括号匹配用栈，LRU 缓存用哈希表+双向链表。"}],Am=Tm,Lm=Dm;function zm(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").replace(/\|(.+)\|/g,(t,r)=>{const i=r.split("|").map(l=>l.trim());return i.every(l=>/^[-:]+$/.test(l))?"":"<tr>"+i.map(l=>`<td>${l}</td>`).join("")+"</tr>"}).split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"")}const Nm=`# 堆 (Heap)

## 概念解释

堆（Heap）是一种特殊的**完全二叉树**，它满足**堆性质**（Heap Property）。堆不是简单的无序集合，而是一种有特定组织规则的树形结构。

### 最大堆与最小堆

堆有两种基本形式：

- **最大堆（Max-Heap）**：对于任意节点，其值**大于等于**其子节点的值。堆顶（根节点）是整个堆中的**最大值**。
- **最小堆（Min-Heap）**：对于任意节点，其值**小于等于**其子节点的值。堆顶是整个堆中的**最小值**。

\`\`\`
最大堆示例：              最小堆示例：

      90                      10
     /  \\                    /  \\
    80   70                 20   30
   / \\   /                 / \\   /
  50 60 40               40 50 60

每个父节点 >= 子节点       每个父节点 <= 子节点
\`\`\`

### 完全二叉树

堆必须是一棵**完全二叉树**（Complete Binary Tree）：除了最后一层外，其他层都是满的，且最后一层的节点从左到右连续排列。这个性质使得堆可以高效地用数组来表示。

### 堆性质（Heap Property）

堆性质是堆的核心约束：
- **最大堆**：\`parent(i) >= i\` 对所有节点成立
- **最小堆**：\`parent(i) <= i\` 对所有节点成立

注意：堆**不保证**兄弟节点之间的大小关系，只保证父子关系。

## 为什么重要

堆在计算机科学中有极其广泛的应用：

### 1. 优先队列（Priority Queue）

堆是实现优先队列最常用的数据结构。优先队列不同于普通队列的"先进先出"，而是**优先级最高的元素先出**。操作系统的任务调度、医院急诊分诊等都是优先队列的典型场景。

### 2. 堆排序（Heap Sort）

利用堆的性质，可以在 O(n log n) 时间内完成排序，且只需要 O(1) 的额外空间（原地排序）。

### 3. 图算法

Dijkstra 最短路径算法和 Prim 最小生成树算法都需要使用最小堆来高效地选择下一个要处理的节点。

### 4. Top-K 问题

从海量数据中找出最大（或最小）的 K 个元素，使用堆可以在 O(n log K) 时间内完成，远优于排序的 O(n log n)。

### 5. 中位数维护

使用一个最大堆和一个最小堆，可以实时维护数据流的中位数，支持 O(log n) 插入和 O(1) 查询。

## 核心原理

### 数组表示堆

完全二叉树的一个重要特性是可以用数组紧凑地表示，无需指针。对于索引从 0 开始的数组：

\`\`\`
数组: [90, 80, 70, 50, 60, 40]

对应的树结构：
        90           索引: 0
       /  \\
     80    70        索引: 1, 2
    / \\   /
  50  60 40          索引: 3, 4, 5

索引关系：
  父节点:   parent(i) = Math.floor((i - 1) / 2)
  左子节点: left(i)   = 2 * i + 1
  右子节点: right(i)  = 2 * i + 2
\`\`\`

数组表示的优势：
- **空间紧凑**：无需存储指针，节省内存
- **缓存友好**：连续内存访问，CPU 缓存命中率高
- **索引计算简单**：通过简单算术即可定位父子节点

### 上浮操作（Sift-Up / Bubble-Up）

当插入新元素时，将其放在数组末尾（树的最后一层最右边），然后**向上调整**以恢复堆性质：

\`\`\`
插入 85 到最大堆中：

步骤 1: 将 85 放到末尾
        90                  [90, 80, 70, 50, 60, 40, 85]
       /  \\
     80    70
    / \\   / \\
  50  60 40  85  ← 新元素

步骤 2: 85 > 70(父节点)，交换
        90                  [90, 80, 85, 50, 60, 40, 70]
       /  \\
     80    85  ← 上浮
    / \\   / \\
  50  60 40  70

步骤 3: 85 < 90(父节点)，停止
堆性质恢复！
\`\`\`

### 下沉操作（Sift-Down / Bubble-Down）

当移除堆顶元素时，将最后一个元素移到堆顶，然后**向下调整**：

\`\`\`
从最大堆中移除最大值：

步骤 1: 移除堆顶 90，将末尾 40 放到堆顶
        40                  [40, 80, 70, 50, 60]
       /  \\
     80    70
    / \\
  50  60

步骤 2: 40 < 80(较大子节点)，交换
        80                  [80, 40, 70, 50, 60]
       /  \\
     40    70
    / \\
  50  60

步骤 3: 40 < 60(较大子节点)，交换
        80                  [80, 60, 70, 50, 40]
       /  \\
     60    70
    / \\
  50  40  ← 下沉到底

堆性质恢复！返回移除的值 90。
\`\`\`

### 建堆操作（Build Heap）

将一个无序数组转换为堆。朴素方法是逐个插入，时间复杂度 O(n log n)。更优的方法是**自底向上**调用下沉操作：

\`\`\`
原始数组: [10, 40, 30, 60, 50, 20, 70]

从最后一个非叶子节点开始（索引 = n/2 - 1 = 2），自右向左下沉：

索引 2: 下沉 30 → [10, 40, 70, 60, 50, 20, 30]
索引 1: 下沉 40 → [10, 60, 70, 40, 50, 20, 30]
索引 0: 下沉 10 → [70, 60, 30, 40, 50, 20, 10]

最终堆:       70
             /  \\
           60    30
          / \\   / \\
        40  50 20  10
\`\`\`

时间复杂度分析：虽然看起来是 O(n log n)，但通过数学分析可以证明总操作次数约为 2n，即 **O(n)**。

### 插入操作（Insert）

1. 将新元素添加到数组末尾
2. 执行上浮操作（Sift-Up）
3. 时间复杂度：**O(log n)**（最多上浮树的高度）

### 取最值操作（Extract-Min / Extract-Max）

1. 保存堆顶元素（最大值或最小值）
2. 将最后一个元素移到堆顶
3. 执行下沉操作（Sift-Down）
4. 时间复杂度：**O(log n)**（最多下沉树的高度）

### 时间复杂度总结

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 插入 | O(log n) | 上浮操作 |
| 取最值 | O(log n) | 下沉操作 |
| 查看最值 | O(1) | 堆顶即是最值 |
| 建堆 | O(n) | 自底向上下沉 |
| 堆排序 | O(n log n) | 建堆 + n次取最值 |

## 可视化说明

在可视化面板中，你可以直观地观察堆的操作过程：

### 双视图展示
- **树形视图**：以完全二叉树的形式展示堆的结构，清晰地看到父子关系
- **数组视图**：以数组的形式展示堆的底层存储，与树形视图同步更新

### 插入动画
1. 新元素出现在数组末尾（树的最后一层最右边）
2. 新元素与父节点比较，如果违反堆性质则交换
3. 重复步骤 2 直到堆性质恢复或到达根节点

### 取最值动画
1. 堆顶元素（最大/最小值）被高亮标记并移除
2. 最后一个元素移到堆顶
3. 与子节点比较，与较大/较小的子节点交换
4. 重复步骤 3 直到堆性质恢复或到达叶子节点

### 控制功能
- **播放/暂停**：控制动画播放
- **速度调节**：调整动画速度
- **重置**：恢复到初始状态

## 常见错误

### 1. 混淆父子节点索引公式

\`\`\`
❌ 错误：索引从 1 开始的公式用在了从 0 开始的数组上
父节点: Math.floor(i / 2)     // 这是索引从 1 开始的公式！

✅ 正确：索引从 0 开始
父节点: Math.floor((i - 1) / 2)
左子节点: 2 * i + 1
右子节点: 2 * i + 2
\`\`\`

### 2. 删除堆顶后忘记下沉

\`\`\`
❌ 错误：移除堆顶后直接返回，不调整堆
extractMax() {
  const max = this.data[0]
  this.data[0] = this.data.pop()  // 只替换，没有下沉！
  return max
}

✅ 正确：替换后必须下沉
extractMax() {
  const max = this.data[0]
  this.data[0] = this.data.pop()
  this.siftDown(0)  // 必须下沉恢复堆性质
  return max
}
\`\`\`

### 3. 数组越界问题

\`\`\`
❌ 错误：下沉时没有检查子节点是否越界
siftDown(i) {
  const left = 2 * i + 1
  if (this.data[left] > this.data[i]) { ... }  // left 可能越界！

✅ 正确：先检查子节点索引是否有效
siftDown(i) {
  const left = 2 * i + 1
  if (left >= this.size) return  // 没有子节点，停止
  // ...
}
\`\`\`

### 4. 只比较一个子节点

\`\`\`
❌ 错误：下沉时只与左子节点比较
if (this.data[left] > this.data[i]) {
  swap(i, left)  // 可能右子节点更大！
}

✅ 正确：找到较大的子节点再比较
let larger = left
if (right < this.size && this.data[right] > this.data[left]) {
  larger = right
}
if (this.data[larger] > this.data[i]) {
  swap(i, larger)
}
\`\`\`

## 实际应用

### 1. 任务调度系统

操作系统使用优先队列管理进程调度，优先级高的进程先执行：

\`\`\`typescript
interface Task {
  name: string
  priority: number  // 数字越大优先级越高
}

class TaskScheduler {
  private heap: Task[] = []

  addTask(task: Task): void {
    this.heap.push(task)
    this.siftUp(this.heap.length - 1)
  }

  getNextTask(): Task | undefined {
    if (this.heap.length === 0) return undefined
    const task = this.heap[0]
    this.heap[0] = this.heap[this.heap.length - 1]
    this.heap.pop()
    this.siftDown(0)
    return task
  }
}
\`\`\`

### 2. 合并 K 个有序链表

使用最小堆高效合并 K 个有序链表，时间复杂度 O(N log K)：

\`\`\`typescript
function mergeKLists(lists: ListNode[]): ListNode {
  const minHeap = new MinHeap<ListNode>((a, b) => a.val - b.val)

  // 将每个链表的头节点加入堆
  for (const list of lists) {
    if (list) minHeap.insert(list)
  }

  const dummy = new ListNode(0)
  let current = dummy

  while (minHeap.size > 0) {
    const node = minHeap.extract()!
    current.next = node
    current = current.next
    if (node.next) minHeap.insert(node.next)
  }

  return dummy.next
}
\`\`\`

### 3. Top-K 问题

从 N 个元素中找出最大的 K 个，使用大小为 K 的最小堆，时间复杂度 O(N log K)：

\`\`\`typescript
function topK(arr: number[], k: number): number[] {
  const minHeap = new MinHeap()

  for (const num of arr) {
    if (minHeap.size < k) {
      minHeap.insert(num)
    } else if (num > minHeap.peek()!) {
      minHeap.extract()
      minHeap.insert(num)
    }
  }

  return minHeap.toArray().sort((a, b) => b - a)
}
\`\`\`

### 4. 数据流中位数维护

使用一个最大堆存较小的一半，一个最小堆存较大的一半：

\`\`\`typescript
class MedianFinder {
  private maxHeap = new MaxHeap()  // 存较小的一半
  private minHeap = new MinHeap()  // 存较大的一半

  addNum(num: number): void {
    this.maxHeap.insert(num)
    this.minHeap.insert(this.maxHeap.extract()!)

    // 保持 maxHeap.size >= minHeap.size
    if (this.minHeap.size > this.maxHeap.size) {
      this.maxHeap.insert(this.minHeap.extract()!)
    }
  }

  findMedian(): number {
    if (this.maxHeap.size > this.minHeap.size) {
      return this.maxHeap.peek()!
    }
    return (this.maxHeap.peek()! + this.minHeap.peek()!) / 2
  }
}
\`\`\`

### 5. Dijkstra 最短路径算法

使用最小堆高效选择下一个距离最短的未访问节点：

\`\`\`typescript
function dijkstra(graph: number[][], start: number): number[] {
  const dist = new Array(graph.length).fill(Infinity)
  dist[start] = 0
  const minHeap = new MinHeap<[number, number]>((a, b) => a[1] - b[1])
  minHeap.insert([start, 0])

  while (minHeap.size > 0) {
    const [u, d] = minHeap.extract()!
    if (d > dist[u]) continue

    for (let v = 0; v < graph[u].length; v++) {
      if (graph[u][v] > 0) {
        const newDist = dist[u] + graph[u][v]
        if (newDist < dist[v]) {
          dist[v] = newDist
          minHeap.insert([v, newDist])
        }
      }
    }
  }

  return dist
}
\`\`\`

## 总结

堆是一种高效的数据结构，核心要点如下：

- **本质**：满足堆性质的完全二叉树，可紧凑地用数组表示
- **两种类型**：最大堆（父 >= 子）和最小堆（父 <= 子）
- **核心操作**：插入 O(log n)、取最值 O(log n)、查看最值 O(1)
- **建堆**：自底向上下沉，O(n) 时间复杂度
- **数组索引**：父节点 (i-1)/2，左子 2i+1，右子 2i+2（从 0 开始）
- **关键操作**：上浮（插入时）和下沉（删除时）是维护堆性质的核心
- **广泛应用**：优先队列、堆排序、Top-K、中位数维护、图算法

掌握堆的原理和实现，是理解许多高级算法和系统设计的基础。堆排序、优先队列、以及各种基于堆的优化技巧，在面试和实际开发中都有高频出现。理解数组与树之间的映射关系，也是学习更复杂树形数据结构的重要基础。`,Fm=zm(Nm);te.register("heap",{metadata:Am,articleHtml:Fm,quiz:Lm,getVisualization:()=>x(()=>import("./visualization-50UDHDzC.js"),[]),getDemo:()=>x(()=>import("./demo-C_6a2CxX.js"),[])});const Mm="recursion",Rm="递归",Bm="函数调用自身的编程技巧，是分治、回溯、动态规划的基础",Im="基础线性结构",Vm="intermediate",Hm=["递归","分治","回溯","调用栈"],Wm=9,bu={id:Mm,title:Rm,description:Bm,category:Im,difficulty:Vm,tags:Hm,order:Wm},Um=[{question:"递归函数中，基本情况（base case）的主要作用是什么？",options:["提高程序运行速度","终止递归，防止无限调用","减少内存占用","让代码更简洁"],answer:1,explanation:"基本情况是递归的终止条件。没有正确的基本情况，递归函数会无限调用自身，最终导致栈溢出（Stack Overflow）。基本情况返回一个不再需要递归的确定值，是递归正确性的根本保证。"},{question:"当递归函数 factorial(5) 被调用时，调用栈中同时最多会有多少个栈帧？",options:["4 个","5 个","6 个","7 个"],answer:1,explanation:"factorial(5) 调用 factorial(4)，依次调用 factorial(3)、factorial(2)、factorial(1)。factorial(1) 命中基本情况（n <= 1 return 1）直接返回，不再继续调用。此时栈中同时存在 factorial(5)、factorial(4)、factorial(3)、factorial(2)、factorial(1) 共 5 个栈帧。"},{question:"什么是尾递归优化（Tail Recursion Optimization）？",options:["将递归放在函数的中间位置","递归调用是函数的最后一个操作，编译器可以复用当前栈帧","在递归之前先执行所有计算","使用循环代替递归"],answer:1,explanation:"尾递归是指递归调用是函数中最后执行的操作，没有其他计算需要在递归返回后进行。支持尾调用优化（TCO）的编译器/解释器可以复用当前栈帧，将递归转化为循环，避免栈溢出。例如：factorial(n, acc=1) 中 if n<=1 return acc else return factorial(n-1, n*acc) 是尾递归形式。"},{question:"斐波那契数列的朴素递归实现 fib(n) 的时间复杂度是多少？为什么？",options:["O(n)，因为递归 n 层","O(n log n)，因为每层分两次","O(2^n)，因为存在大量重复计算","O(n!)，因为是阶乘级增长"],answer:2,explanation:"朴素递归的 fib(n) 会重复计算相同的子问题。例如 fib(5) 需要计算 fib(4) 和 fib(3)，而 fib(4) 也要计算 fib(3)——fib(3) 被计算了两次。随着 n 增大，重复计算呈指数级增长，时间复杂度为 O(2^n)。通过记忆化（memoization）可以优化到 O(n)。"},{question:"以下迭代代码用 while 循环计算阶乘。将其转换为递归版本时，最关键的是什么？\n\n```\nlet result = 1\nfor (let i = n; i > 0; i--)\n  result *= i\n```",options:["将循环变量 i 改为全局变量","确定基本情况（i <= 1 时返回）和递归关系（n * f(n-1)）","使用 for 循环包装递归函数","将 result 变量改为数组"],answer:1,explanation:"将迭代转换为递归的关键是：1）确定基本情况——循环终止条件对应递归的 base case（i <= 1 时返回 1）；2）确定递归关系——循环体的操作对应递归表达式（result *= i 对应 n * factorial(n-1)）。递归版本：function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); }"}],qm=`# 递归 (Recursion)

## 概念解释

递归是一种编程技巧，指的是**函数直接或间接调用自身**来解决问题。递归的核心思想是：将一个大问题分解为结构相同但规模更小的子问题，直到子问题足够简单可以直接求解。

一个完整的递归函数包含两个关键部分：

- **基本情况（Base Case）**：递归的终止条件，不再调用自身，直接返回一个确定的值。它是递归的"出口"。
- **递归情况（Recursive Case）**：将问题分解为更小的子问题，调用自身来解决。

\`\`\`typescript
// 阶乘函数 —— 递归的经典示例
function factorial(n: number): number {
  // 基本情况：0! = 1，1! = 1
  if (n <= 1) return 1
  // 递归情况：n! = n × (n-1)!
  return n * factorial(n - 1)
}
\`\`\`

### 调用栈与栈帧

每当一个函数被调用时，系统会在**调用栈（Call Stack）**上分配一块内存，称为**栈帧（Stack Frame）**。栈帧中存储了函数的参数、局部变量和返回地址。

\`\`\`
调用栈示意图（factorial(4) 的执行过程）：

  调用 factorial(4)
  ┌─────────────────┐
  │ factorial(4)     │  等待 factorial(3) 的结果
  │ n = 4            │
  │ 返回地址: main   │
  └─────────────────┘
  ┌─────────────────┐
  │ factorial(3)     │  等待 factorial(2) 的结果
  │ n = 3            │
  │ 返回地址: f(4)   │
  └─────────────────┘
  ┌─────────────────┐
  │ factorial(2)     │  等待 factorial(1) 的结果
  │ n = 2            │
  │ 返回地址: f(3)   │
  └─────────────────┘
  ┌─────────────────┐
  │ factorial(1)     │  命中基本情况，返回 1
  │ n = 1            │
  │ 返回地址: f(2)   │
  └─────────────────┘
  栈底
\`\`\`

当函数返回时，它的栈帧被弹出，控制权交还给调用者。如果递归层数太深，调用栈空间耗尽，就会发生**栈溢出（Stack Overflow）**。

## 为什么重要

递归是计算机科学中最基础、最重要的思想之一：

### 1. 分治策略的基础

分治法（Divide and Conquer）将问题分成若干子问题，递归求解后合并结果。归并排序、快速排序、二分查找等经典算法都基于递归。

### 2. 回溯算法的核心

回溯法通过递归系统地搜索所有可能的解，当发现当前路径不可行时"回退"。八皇后、数独求解、迷宫路径等问题都使用回溯。

### 3. 树与图的遍历

树的前序、中序、后序遍历天然是递归的。图的深度优先搜索（DFS）也用递归实现最为直观。

### 4. 数学归纳法的映射

递归与数学归纳法有天然的对应关系：基本情况对应归纳法的初始步骤，递归情况对应归纳步骤。理解递归有助于理解数学证明，反之亦然。

## 核心原理

### 调用栈的工作机制

每次递归调用都会在调用栈上压入一个新的栈帧。栈帧包含：

- **函数参数**：当前调用的实参值
- **返回地址**：函数执行完毕后应该回到哪里继续执行
- **局部变量**：函数内部声明的变量
- **返回值**：函数的计算结果

\`\`\`
factorial(3) 的栈帧变化过程：

步骤1: 调用 factorial(3)
  栈: [factorial(3)]

步骤2: 调用 factorial(2)
  栈: [factorial(3), factorial(2)]

步骤3: 调用 factorial(1)
  栈: [factorial(3), factorial(2), factorial(1)]

步骤4: factorial(1) 返回 1，弹出栈帧
  栈: [factorial(3), factorial(2)]

步骤5: factorial(2) 得到 1*2=2，返回，弹出
  栈: [factorial(3)]

步骤6: factorial(3) 得到 2*3=6，返回，弹出
  栈: []（空）
\`\`\`

### 尾递归

**尾递归（Tail Recursion）**是指递归调用是函数中最后执行的操作，递归返回后不需要再做任何计算。

\`\`\`typescript
// 普通递归：递归返回后还要做 n * ... 的乘法
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)  // 递归调用不是最后一步
}

// 尾递归：递归调用就是最后一步，结果通过累加器传递
function factorialTail(n: number, acc: number = 1): number {
  if (n <= 1) return acc
  return factorialTail(n - 1, n * acc)  // 递归调用是最后一步
}
\`\`\`

支持尾调用优化（TCO）的语言/引擎可以将尾递归转化为循环，复用当前栈帧，避免栈溢出。JavaScript 的严格模式下部分引擎支持 TCO，但并非所有环境都支持。

### 递归 vs 迭代

| 特性 | 递归 | 迭代 |
|------|------|------|
| 代码风格 | 简洁、直观 | 通常更冗长 |
| 内存使用 | 每次调用消耗栈帧 | 通常更少 |
| 栈溢出风险 | 深度过大会溢出 | 无此风险 |
| 性能 | 函数调用有开销 | 通常更快 |
| 适用场景 | 树/图遍历、分治、回溯 | 线性遍历、简单循环 |

任何递归都可以转化为迭代（通常借助显式栈），任何迭代也可以转化为递归。选择哪种方式取决于问题特性和代码可读性。

### 时间与空间复杂度分析

递归算法的复杂度分析通常使用**递推关系（Recurrence Relation）**：

- **阶乘 factorial(n)**：T(n) = T(n-1) + O(1)，时间 O(n)，空间 O(n)（栈深度）
- **斐波那契 fib(n)（朴素）**：T(n) = T(n-1) + T(n-2) + O(1)，时间 O(2^n)，空间 O(n)
- **归并排序**：T(n) = 2T(n/2) + O(n)，时间 O(n log n)，空间 O(n)
- **二分查找**：T(n) = T(n/2) + O(1)，时间 O(log n)，空间 O(log n)

空间复杂度通常是递归的最大深度，即调用栈中同时存在的最大栈帧数。

## 可视化说明

在右侧的可视化面板中，你可以直观地观察递归的执行过程：

- **调用栈动画**：每次递归调用时，新的栈帧从顶部压入；返回时栈帧弹出
- **阶乘演示**：逐步展示 factorial(n) 的调用和返回过程，显示每个栈帧的参数和返回值
- **斐波那契树**：展示递归调用树，对比朴素递归和记忆化递归的计算次数差异
- **汉诺塔**：展示圆盘的移动步骤

通过控制栏，你可以：

- 播放 / 暂停动画
- 调整动画速度
- 选择不同的演示模式
- 重置到初始状态

## 常见错误

### 1. 缺少基本情况 —— 栈溢出

\`\`\`typescript
// 错误：没有基本情况，无限递归！
function badRecursion(n: number): number {
  return badRecursion(n - 1)  // 永远不会停止
}
// 结果：Maximum call stack size exceeded

// 正确：必须有终止条件
function goodRecursion(n: number): number {
  if (n <= 0) return 0       // 基本情况
  return goodRecursion(n - 1) // 递归情况
}
\`\`\`

### 2. 基本情况错误 —— 结果不正确

\`\`\`typescript
// 错误：基本情况的返回值不对
function factorial(n: number): number {
  if (n === 0) return 0  // 错！0! = 1，不是 0
  return n * factorial(n - 1)
}
// factorial(5) = 5*4*3*2*1*0 = 0（错误）

// 正确：
function factorial(n: number): number {
  if (n <= 1) return 1   // 0! = 1, 1! = 1
  return n * factorial(n - 1)
}
\`\`\`

### 3. 斐波那契的重复计算

\`\`\`typescript
// 朴素递归：存在大量重复计算
function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(3) 被计算了 2 次，fib(2) 被计算了 3 次...
}
// fib(40) 需要约 2^40 次运算，非常慢！

// 记忆化递归：缓存已计算的结果
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)
  return result
}
// fibMemo(40) 只需要约 40 次计算
\`\`\`

### 4. 忘记返回递归结果

\`\`\`typescript
// 错误：没有 return 递归调用的结果
function sum(n: number): number {
  if (n <= 0) return 0
  sum(n - 1)  // 忘了 return！
}
// 结果：undefined（函数没有返回值）

// 正确：
function sum(n: number): number {
  if (n <= 0) return 0
  return n + sum(n - 1)  // 必须 return
}
\`\`\`

## 实际应用

### 1. 阶乘计算

\`\`\`typescript
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
// factorial(5) = 120
\`\`\`

### 2. 斐波那契数列

\`\`\`typescript
// 记忆化版本
function fib(n: number, memo: number[] = []): number {
  if (n <= 1) return n
  if (memo[n] !== undefined) return memo[n]
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
  return memo[n]
}
\`\`\`

### 3. 二叉树遍历

\`\`\`typescript
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

// 前序遍历：根 → 左 → 右
function preorder(node: TreeNode | null): number[] {
  if (!node) return []
  return [node.val, ...preorder(node.left), ...preorder(node.right)]
}

// 中序遍历：左 → 根 → 右（二叉搜索树的有序遍历）
function inorder(node: TreeNode | null): number[] {
  if (!node) return []
  return [...inorder(node.left), node.val, ...inorder(node.right)]
}
\`\`\`

### 4. 归并排序

\`\`\`typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  // 合并两个有序数组
  const result: number[] = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  return result.concat(left.slice(i)).concat(right.slice(j))
}
\`\`\`

### 5. 汉诺塔

\`\`\`typescript
function hanoi(n: number, from: string, to: string, aux: string): string[] {
  if (n === 1) return [\`将圆盘 1 从 \${from} 移到 \${to}\`]
  return [
    ...hanoi(n - 1, from, aux, to),
    \`将圆盘 \${n} 从 \${from} 移到 \${to}\`,
    ...hanoi(n - 1, aux, to, from),
  ]
}
// hanoi(3, 'A', 'C', 'B') 输出 7 步移动过程
\`\`\`

### 6. 全排列生成

\`\`\`typescript
function permutations(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr]

  const result: number[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm])
    }
  }
  return result
}
// permutations([1,2,3]) 输出 6 种排列
\`\`\`

## 总结

递归是将问题分解为相同结构的子问题并调用自身解决的编程技巧。掌握递归需要理解以下要点：

- **两个必要条件**：每个递归函数必须有基本情况（终止条件）和递归情况（缩小问题规模）
- **调用栈机制**：每次递归调用消耗一个栈帧，深度过大会导致栈溢出
- **尾递归优化**：将递归调用放在最后一步，可被优化为循环
- **记忆化技术**：缓存已计算结果，避免重复计算（如斐波那契数列）
- **复杂度分析**：通过递推关系分析时间和空间复杂度

递归是分治、回溯、动态规划等高级算法思想的基础，也是树和图遍历的天然工具。虽然迭代在性能上通常更优，但递归的代码往往更简洁、更接近问题的数学定义，在很多场景下是更好的选择。
`,Zu={...bu,difficulty:bu.difficulty},Km=Um;function Qm(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(o=>o.trim());if(i.every(o=>/^[-:]+$/.test(o)))return"<!-- table separator -->";const l="td";return`<tr>${i.map(o=>`<${l}>${o}</${l}>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(Zu.id,{metadata:Zu,articleHtml:Qm(qm),quiz:Km,getVisualization:()=>x(()=>import("./visualization-BzmLRmxW.js"),[]),getDemo:()=>x(()=>import("./demo-BhRU7ONa.js"),[])});const Ym="graph",Xm="图",Gm="由顶点和边组成的关系结构，用于建模复杂网络",Jm="树形结构",bm="intermediate",Zm=["图论","BFS","DFS","邻接表"],eh=8,nh={id:Ym,title:Xm,description:Gm,category:Jm,difficulty:bm,tags:Zm,order:eh},th=[{question:"对于一个稀疏图（边数远小于顶点数的平方），哪种表示方式更节省空间？",options:["邻接矩阵","邻接表","两者相同","取决于顶点数量"],answer:1,explanation:"邻接矩阵需要 O(V²) 的空间，无论边有多少。而邻接表只需要 O(V + E) 的空间。对于稀疏图（E << V²），邻接表明显更节省空间。例如 1000 个顶点、5000 条边的图，邻接矩阵需要 100 万个单元，而邻接表只需要约 6000 个单元。"},{question:"BFS（广度优先搜索）使用什么数据结构来管理待访问的节点？",options:["栈 (Stack)","队列 (Queue)","优先队列 (Priority Queue)","哈希表 (Hash Map)"],answer:1,explanation:"BFS 使用队列（先进先出）来管理待访问的节点。这保证了节点按层级顺序被访问：先访问所有距离为 1 的节点，再访问距离为 2 的节点，依此类推。DFS 则使用栈（或递归调用栈）来实现深度优先的访问顺序。"},{question:"对一个包含 V 个顶点和 E 条边的图进行 BFS 或 DFS 遍历，时间复杂度是多少？",options:["O(V)","O(E)","O(V + E)","O(V × E)"],answer:2,explanation:"BFS 和 DFS 的时间复杂度都是 O(V + E)。其中 O(V) 来自访问每个顶点一次，O(E) 来自检查每条边一次（邻接表表示下）。如果使用邻接矩阵，时间复杂度为 O(V²)，因为需要检查每个顶点与其他所有顶点的连接关系。"},{question:"检测有向图中是否存在环，以下哪种方法不可行？",options:["使用 DFS 并维护递归栈（三色标记法）","使用 Kahn 算法（拓扑排序）","仅检查是否存在自环边","对每个未访问节点执行 DFS，检测后向边"],answer:2,explanation:"仅检查自环边（顶点指向自身的边）无法检测到更复杂的环，例如 A→B→C→A。正确的环检测方法包括：(1) DFS 三色标记法——白色未访问、灰色正在访问、黑色已完成，遇到灰色节点说明有环；(2) Kahn 算法——如果拓扑排序无法包含所有顶点，则图中有环。"},{question:"以下哪个场景最适合用图来建模？",options:["实现一个后退/前进功能的浏览器","表示城市之间的道路网络和导航路线","管理一组待办事项的优先级","缓存最近使用的数据"],answer:1,explanation:"城市道路网络是图的经典应用：城市是顶点（节点），道路是边，距离或时间是权重。导航系统（如 Google Maps）使用图的最短路径算法（如 Dijkstra）来计算最优路线。浏览器后退/前进适合用栈，优先级管理适合用堆，缓存适合用哈希表+双向链表（LRU）。"}],rh=nh,ih=th;function lh(e){let n=e;return n=n.replace(/^### (.+)$/gm,"<h3>$1</h3>"),n=n.replace(/^## (.+)$/gm,"<h2>$1</h2>"),n=n.replace(/^# (.+)$/gm,"<h1>$1</h1>"),n=n.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),n=n.replace(/\*(.+?)\*/g,"<em>$1</em>"),n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>{const l=i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<pre><code class="language-${r}">${l}</code></pre>`}),n=n.replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(o=>o.trim());if(i.every(o=>/^[-:]+$/.test(o)))return"<!-- table separator -->";const l="td";return`<tr>${i.map(o=>`<${l}>${o}</${l}>`).join("")}</tr>`}),n=n.replace(/((?:<tr>.*<\/tr>\n?)+)/g,t=>{const r=t.replace(/<!-- table separator -->\n?/g,"");if(!r.trim())return"";const i=r.match(/<tr>(.*?)<\/tr>/);if(i){const o=`<thead><tr>${i[1].replace(/<td>/g,"<th>").replace(/<\/td>/g,"</th>")}</tr></thead>`,u=r.replace(i[0],"");return`<table>${o}<tbody>${u}</tbody></table>`}return`<table>${r}</table>`}),n=n.replace(/^- (.+)$/gm,"<li>$1</li>"),n=n.replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`),n=n.replace(/^\d+\. (.+)$/gm,"<li>$1</li>"),n=n.split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<table")||r.startsWith("<thead")||r.startsWith("<tbody")||r.startsWith("<!--")?r:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`),n=n.replace(/<p><\/p>/g,""),n=n.replace(/<p><!-- table separator --><\/p>/g,""),n}const oh=`# 图 (Graph)

## 概念解释

图是一种由**顶点**（Vertex，也叫节点 Node）和**边**（Edge）组成的数据结构，用于表示对象之间的关系。与树不同，图没有严格的层次结构，任意两个顶点之间都可以有连接。

### 核心术语

- **顶点 (Vertex)**：图中的基本单元，代表一个对象或实体。例如社交网络中的一个用户、地图中的一个城市。
- **边 (Edge)**：连接两个顶点的关系。边可以是有向的或无向的，可以有权重。
- **有向图 (Directed Graph)**：边有方向，从一个顶点指向另一个顶点。例如 Twitter 的关注关系——你关注某人，但对方不一定关注你。
- **无向图 (Undirected Graph)**：边没有方向，表示双向关系。例如微信好友关系——A 是 B 的好友，B 也是 A 的好友。
- **加权图 (Weighted Graph)**：每条边有一个数值权重，表示距离、时间、费用等。例如地图上两个城市之间的距离。
- **度 (Degree)**：与一个顶点相连的边的数量。在有向图中分为**入度**（指向该顶点的边数）和**出度**（从该顶点出发的边数）。
- **路径 (Path)**：从一个顶点到另一个顶点经过的顶点序列。路径长度通常用经过的边数或权重之和来衡量。
- **环 (Cycle)**：起点和终点相同的路径。有环图和无环图（DAG，有向无环图）在算法处理上有很大区别。

\`\`\`
无向图示例:                有向图示例:
  A --- B                  A → B
  |     |                  ↑   ↓
  C --- D                  D ← C

加权图示例:
  A --5-- B
  |       |
  3       2
  |       |
  C --7-- D
\`\`\`

## 为什么重要

图是计算机科学中用途最广泛的数据结构之一，它能自然地建模现实世界中的各种关系网络：

**社交网络**：Facebook、微信等社交平台中，用户是顶点，好友关系是边。通过图算法可以找到"你可能认识的人"（共同好友）、计算社交距离、检测社区结构。

**地图与导航**：Google Maps、高德地图等导航系统中，路口是顶点，道路是边，距离或时间是权重。Dijkstra 算法、A* 算法等图的最短路径算法是导航的核心。

**依赖管理**：编译器、包管理器（npm、pip）使用有向无环图（DAG）来表示模块之间的依赖关系，通过拓扑排序确定编译或安装顺序。

**网络路由**：互联网中的路由器使用图算法（如 OSPF、BGP）来确定数据包的最优传输路径。

**搜索引擎**：Google 的 PageRank 算法将互联网看作一个巨大的有向图——网页是顶点，超链接是边，通过分析链接结构来评估网页的重要性。

## 核心原理

### 图的存储方式

**邻接矩阵 (Adjacency Matrix)**

用一个 V×V 的二维数组表示图，\`matrix[i][j]\` 表示顶点 i 和顶点 j 之间是否有边（或边的权重）。

\`\`\`typescript
// 邻接矩阵表示
//   0  1  2  3
// 0[0, 1, 1, 0]    顶点 0 连接 1, 2
// 1[1, 0, 0, 1]    顶点 1 连接 0, 3
// 2[1, 0, 0, 1]    顶点 2 连接 0, 3
// 3[0, 1, 1, 0]    顶点 3 连接 1, 2

const matrix: number[][] = [
  [0, 1, 1, 0],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
]
\`\`\`

**邻接表 (Adjacency List)**

用数组（或哈希表）存储每个顶点的邻居列表。每个顶点对应一个链表或数组，包含所有与之相邻的顶点。

\`\`\`typescript
// 邻接表表示
const adjList: Map<number, number[]> = new Map([
  [0, [1, 2]],
  [1, [0, 3]],
  [2, [0, 3]],
  [3, [1, 2]],
])
\`\`\`

**两种方式的对比：**

| 操作 | 邻接矩阵 | 邻接表 |
|------|----------|--------|
| 空间复杂度 | O(V²) | O(V + E) |
| 判断两顶点是否相邻 | O(1) | O(degree) |
| 获取某顶点的所有邻居 | O(V) | O(degree) |
| 添加边 | O(1) | O(1) |
| 删除边 | O(1) | O(degree) |
| 适用场景 | 稠密图 | 稀疏图 |

大多数实际应用中，图是稀疏的（边数远小于 V²），因此邻接表更为常用。

### 广度优先搜索 (BFS)

BFS 从起始顶点开始，逐层向外扩展访问。它使用**队列**来管理待访问的顶点，保证按距离从近到远的顺序访问。

\`\`\`typescript
function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>()
  const queue: number[] = [start]
  const result: number[] = []
  visited.add(start)

  while (queue.length > 0) {
    const node = queue.shift()!  // 出队
    result.push(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)  // 入队
      }
    }
  }
  return result
}
\`\`\`

**BFS 的特点：**
- 使用队列（FIFO）管理访问顺序
- 找到的路径是**最短路径**（无权图中）
- 时间复杂度：O(V + E)
- 空间复杂度：O(V)

### 深度优先搜索 (DFS)

DFS 从起始顶点开始，沿着一条路径尽可能深入，遇到死胡同再回溯。它使用**栈**（或递归调用栈）来实现。

\`\`\`typescript
function dfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>()
  const result: number[] = []

  function traverse(node: number) {
    visited.add(node)
    result.push(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        traverse(neighbor)  // 递归深入
      }
    }
  }

  traverse(start)
  return result
}
\`\`\`

**DFS 的特点：**
- 使用栈（LIFO）或递归来管理访问顺序
- 适合探索所有路径、检测环、拓扑排序
- 时间复杂度：O(V + E)
- 空间复杂度：O(V)

### BFS vs DFS 对比

| 特性 | BFS | DFS |
|------|-----|-----|
| 数据结构 | 队列 | 栈/递归 |
| 访问顺序 | 逐层扩展 | 深入到底再回溯 |
| 最短路径 | 无权图中最短 | 不保证最短 |
| 空间开销 | 较大（需存储整层） | 较小（只需一条路径） |
| 适用场景 | 最短路径、层序遍历 | 拓扑排序、环检测、连通分量 |

## 可视化说明

在可视化界面中，你可以直观地观察图的结构和遍历过程：

1. **图的展示**：顶点以圆形显示，边以线条连接。顶点可以拖拽重新排列，方便观察图的结构。
2. **BFS 动画**：选择 BFS 模式后，可以看到队列的变化过程。节点颜色会变化——灰色表示未访问、黄色表示已入队、蓝色表示正在访问、深色表示已访问完成。
3. **DFS 动画**：选择 DFS 模式后，可以看到栈的变化过程。DFS 会沿着一条路径深入到底，再回溯探索其他分支。
4. **速度控制**：通过滑块调整动画速度，可以慢速观察每个步骤，也可以快速浏览整体过程。

## 常见错误

### 1. 忘记维护 visited 集合导致死循环

\`\`\`typescript
// 错误：没有 visited 集合，遇到环会无限循环
function bfsWrong(graph: Map<number, number[]>, start: number) {
  const queue = [start]
  while (queue.length > 0) {
    const node = queue.shift()!
    for (const neighbor of graph.get(node) || []) {
      queue.push(neighbor)  // 已访问过的节点会重复入队！
    }
  }
}

// 正确：使用 visited 集合避免重复访问
function bfsCorrect(graph: Map<number, number[]>, start: number) {
  const visited = new Set<number>([start])
  const queue = [start]
  while (queue.length > 0) {
    const node = queue.shift()!
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
}
\`\`\`

这是图的遍历中最常见也最危险的错误。树的遍历不需要 visited 集合（因为树没有环），但图可能有环，不记录已访问节点会导致无限循环。

### 2. 混淆有向图和无向图

\`\`\`typescript
// 添加边时，无向图需要添加两个方向
function addEdge(graph: Map<number, number[]>, u: number, v: number, directed: boolean) {
  if (!graph.has(u)) graph.set(u, [])
  graph.get(u)!.push(v)

  if (!directed) {
    // 常见错误：忘记添加反向边
    if (!graph.has(v)) graph.set(v, [])
    graph.get(v)!.push(u)
  }
}
\`\`\`

### 3. 邻接矩阵处理稀疏图浪费空间

对于 10000 个顶点、50000 条边的图，邻接矩阵需要 10000² = 1 亿个单元，而邻接表只需要约 60000 个单元。在实际工程中，选择合适的存储方式非常重要。

## 实际应用

### 1. 社交网络分析

\`\`\`typescript
// 计算两个用户之间的最短社交距离
function socialDistance(friends: Map<string, string[]>, userA: string, userB: string): number {
  const visited = new Set<string>([userA])
  const queue: [string, number][] = [[userA, 0]]

  while (queue.length > 0) {
    const [user, dist] = queue.shift()!
    if (user === userB) return dist
    for (const friend of friends.get(user) || []) {
      if (!visited.has(friend)) {
        visited.add(friend)
        queue.push([friend, dist + 1])
      }
    }
  }
  return -1  // 不可达
}
\`\`\`

### 2. 地图导航（Dijkstra 最短路径）

\`\`\`typescript
// 加权图的最短路径
function dijkstra(graph: Map<string, [string, number][]>, start: string): Map<string, number> {
  const dist = new Map<string, number>()
  const visited = new Set<string>()
  const pq: [number, string][] = [[0, start]]
  dist.set(start, 0)

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, node] = pq.shift()!
    if (visited.has(node)) continue
    visited.add(node)
    for (const [neighbor, weight] of graph.get(node) || []) {
      const newDist = d + weight
      if (!dist.has(neighbor) || newDist < dist.get(neighbor)!) {
        dist.set(neighbor, newDist)
        pq.push([newDist, neighbor])
      }
    }
  }
  return dist
}
\`\`\`

### 3. 编译器依赖分析（拓扑排序）

\`\`\`typescript
// Kahn 算法：拓扑排序
function topologicalSort(graph: Map<number, number[]>, inDegree: Map<number, number>): number[] {
  const queue: number[] = []
  const result: number[] = []

  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node)
  }

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    for (const neighbor of graph.get(node) || []) {
      const newDeg = inDegree.get(neighbor)! - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  if (result.length !== graph.size) {
    throw new Error('图中存在环，无法进行拓扑排序')
  }
  return result
}
\`\`\`

### 4. 网页爬虫

\`\`\`typescript
// 简化的网页爬虫：BFS 遍历链接
async function crawl(startUrl: string, maxPages: number): Promise<string[]> {
  const visited = new Set<string>([startUrl])
  const queue = [startUrl]
  const pages: string[] = []

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    pages.push(url)
    const links = await fetchLinks(url)
    for (const link of links) {
      if (!visited.has(link)) {
        visited.add(link)
        queue.push(link)
      }
    }
  }
  return pages
}
\`\`\`

## 总结

图是最通用的数据结构之一，能够建模各种复杂的关系网络。掌握图的关键要点：

1. **两种存储方式**：邻接矩阵适合稠密图，邻接表适合稀疏图。实际工程中邻接表更常用。
2. **BFS 与 DFS**：BFS 逐层扩展，适合求最短路径；DFS 深入探索，适合拓扑排序和环检测。两者时间复杂度都是 O(V + E)。
3. **visited 集合必不可少**：图可能有环，必须记录已访问节点，否则会陷入无限循环。
4. **丰富的实际应用**：社交网络、地图导航、依赖管理、网络路由、搜索引擎等，图无处不在。

掌握了图的基本概念和算法，你就具备了处理复杂网络问题的能力，为学习更高级的图算法（最短路径、最小生成树、网络流等）打下了坚实基础。`,uh=lh(oh);te.register("graph",{metadata:rh,articleHtml:uh,quiz:ih,getVisualization:()=>x(()=>import("./visualization-CYYLyzi5.js"),[]),getDemo:()=>x(()=>import("./demo-BKamEu9C.js"),[])});const sh="sorting",ah="排序算法",ch="将无序数据排列有序的核心算法，包含冒泡、选择、插入、归并、快排等",fh="排序算法",dh="intermediate",ph=["排序","比较排序","分治","O(nlogn)"],mh=10,hh={id:sh,title:ah,description:ch,category:fh,difficulty:dh,tags:ph,order:mh},gh=[{question:"以下哪种排序算法是稳定的？（即相等元素的相对顺序在排序后不会改变）",options:["快速排序","选择排序","归并排序","堆排序"],answer:2,explanation:"归并排序是稳定排序。在合并两个子数组时，遇到相等元素优先取左边子数组的元素，从而保持了相等元素的原始相对顺序。快速排序和堆排序是不稳定的，选择排序也是不稳定的（交换操作可能改变相等元素的顺序）。"},{question:"对一个近乎有序的（只有少量元素位置不对）小规模数组，哪种排序算法效率最高？",options:["快速排序","归并排序","插入排序","选择排序"],answer:2,explanation:"插入排序在近乎有序的数据上表现极佳，时间复杂度接近 O(n)。因为每个元素只需要少量比较和移动就能找到正确位置。这也是为什么许多高级排序算法（如 Timsort）在小规模子数组上会切换到插入排序。"},{question:"快速排序在最坏情况下的时间复杂度是多少？什么情况会导致最坏情况？",options:["O(n)，数组已经有序","O(n log n)，数组元素全部相同","O(n²)，每次选择的枢轴都是最大或最小元素","O(n²)，数组长度为奇数"],answer:2,explanation:"快速排序最坏时间复杂度为 O(n²)。当每次选择的枢轴（pivot）恰好是当前子数组的最大或最小元素时，分区极度不平衡——一边有 n-1 个元素，另一边为空。这会导致递归深度达到 n 层，每层需要 O(n) 的比较，总计 O(n²)。对已排序数组取首元素作枢轴就会触发此情况。"},{question:"关于归并排序和快速排序的比较，以下哪项是正确的？",options:["归并排序是原地排序，快速排序需要额外空间","快速排序是稳定排序，归并排序不是","归并排序总是 O(n log n)，快速排序平均 O(n log n) 但最坏 O(n²)","快速排序的空间复杂度为 O(n)，归并排序为 O(1)"],answer:2,explanation:"归并排序在所有情况下（最好、平均、最坏）时间复杂度都是 O(n log n)，非常稳定。快速排序平均情况为 O(n log n)，但最坏情况为 O(n²)。不过快速排序的常数因子较小，实际运行通常更快。归并排序需要 O(n) 额外空间，快速排序是原地排序（O(log n) 递归栈空间）。"},{question:"基于比较的排序算法，其时间复杂度的理论下界是多少？",options:["O(n)","O(n log n)","O(n²)","O(log n)"],answer:1,explanation:"基于比较的排序算法的时间复杂度下界是 O(n log n)。这可以通过决策树模型证明：n 个元素有 n! 种排列，一棵二叉决策树至少需要 log₂(n!) ≈ n log₂n 个叶子节点，因此树的高度（即最坏情况比较次数）至少为 O(n log n)。计数排序、基数排序等非比较排序可以突破这个下界。"}],yh=hh,vh=gh;function wh(e){let n=e;n=n.replace(/^### (.+)$/gm,"<h3>$1</h3>"),n=n.replace(/^## (.+)$/gm,"<h2>$1</h2>"),n=n.replace(/^# (.+)$/gm,"<h1>$1</h1>"),n=n.replace(/```(\w*)\n([\s\S]*?)```/g,(l,o,u)=>{const s=u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<pre><code class="language-${o}">${s}</code></pre>`}),n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),n=n.replace(/\*([^*]+)\*/g,"<em>$1</em>"),n=n.replace(/^\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/gm,(l,o,u)=>{const s=o.split("|").map(p=>p.trim()).filter(p=>p),c=u.trim().split(`
`).map(p=>p.split("|").map(m=>m.trim()).filter(m=>m));let h=`<table>
<thead><tr>`;return s.forEach(p=>{h+=`<th>${p}</th>`}),h+=`</tr></thead>
<tbody>`,c.forEach(p=>{h+="<tr>",p.forEach(m=>{h+=`<td>${m}</td>`}),h+="</tr>"}),h+=`</tbody>
</table>`,h}),n=n.replace(/^- (.+)$/gm,"<li>$1</li>"),n=n.replace(/((?:<li>.*<\/li>\n?)+)/g,"<ul>$1</ul>"),n=n.replace(/^\d+\. (.+)$/gm,"<li>$1</li>");const t=n.split(`
`),r=[];let i=!1;for(const l of t){const o=l.trim();o.startsWith("<h")||o.startsWith("<pre")||o.startsWith("<ul")||o.startsWith("<ol")||o.startsWith("<table")||o.startsWith("<thead")||o.startsWith("<tbody")||o.startsWith("<tr")||o.startsWith("</")||o.startsWith("<li")?(r.push(l),o.startsWith("<pre")&&(i=!0),o.startsWith("</pre>")&&(i=!1)):o===""?r.push(""):i?r.push(l):r.push(`<p>${o}</p>`)}return r.join(`
`)}const kh=`# 排序算法 (Sorting Algorithms)

## 概念解释

排序是将一组数据按照特定顺序（通常是升序或降序）重新排列的过程。它是计算机科学中最基础、研究最深入的问题之一。

### 核心术语

- **稳定排序（Stable Sort）**：如果两个相等元素在原始数组中的相对顺序是 A 在 B 前面，排序后 A 仍然在 B 前面，则该排序算法是稳定的。例如，对 \`[(3,a), (1,b), (3,c)]\` 排序，稳定排序结果为 \`[(1,b), (3,a), (3,c)]\`，不稳定的排序可能得到 \`[(1,b), (3,c), (3,a)]\`。

- **原地排序（In-Place Sort）**：不需要额外的 O(n) 空间，只使用 O(1) 或 O(log n) 的辅助空间。冒泡排序、选择排序、插入排序、快速排序都是原地排序，归并排序通常不是。

- **比较排序（Comparison Sort）**：通过元素之间的比较来决定排序顺序。冒泡、选择、插入、归并、快排、堆排序都属于比较排序。计数排序、基数排序、桶排序属于非比较排序。

- **时间复杂度下界**：基于比较的排序算法，理论最优时间复杂度为 O(n log n)。这可以通过决策树模型证明——n 个元素有 n! 种排列，决策树高度至少为 log₂(n!) ≈ n log n。

### 常见排序算法复杂度一览

| 算法 | 最好 | 平均 | 最坏 | 空间 | 稳定 |
|------|------|------|------|------|------|
| 冒泡排序 | O(n) | O(n²) | O(n²) | O(1) | 是 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 否 |
| 插入排序 | O(n) | O(n²) | O(n²) | O(1) | 是 |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) | 是 |
| 快速排序 | O(n log n) | O(n log n) | O(n²) | O(log n) | 否 |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) | 否 |

## 为什么重要

排序看似简单，却是计算机科学中最重要的基础操作之一：

### 二分查找的前提

二分查找要求数组有序。如果没有排序，就无法使用 O(log n) 的二分查找，只能用 O(n) 的线性查找。在大规模数据中，这个差距是巨大的。

### 数据库查询优化

数据库的 ORDER BY、GROUP BY、JOIN 操作在底层大量使用排序。数据库引擎的查询优化器会评估是否使用排序来加速查询。

### 数据分析的基础

统计中位数、查找第 k 大元素、数据去重、数据分组——这些操作都依赖于有序数据。

### 算法设计的核心

分治算法、贪心算法等经典算法范式常常需要排序作为预处理步骤。排序是很多高级算法的基石。

### 面试的高频考点

排序算法是技术面试中最常见的话题之一，考察对算法设计、时间空间复杂度分析、边界条件处理的理解。

## 核心原理

### 冒泡排序 (Bubble Sort)

冒泡排序是最直观的排序算法。它重复地遍历数组，比较相邻元素，如果顺序错误就交换它们。每一轮遍历后，最大的未排序元素会"冒泡"到正确位置。

**算法步骤**：
1. 从数组第一个元素开始，依次比较相邻的两个元素
2. 如果前一个元素比后一个大，交换它们
3. 重复上述过程，直到没有需要交换的元素

\`\`\`
初始: [5, 3, 8, 1, 2]

第1轮: [3, 5, 1, 2, 8]  -- 8 冒泡到最后
第2轮: [3, 1, 2, 5, 8]  -- 5 冒泡到倒数第二
第3轮: [1, 2, 3, 5, 8]  -- 3 冒泡到正确位置
第4轮: [1, 2, 3, 5, 8]  -- 没有交换，排序完成
\`\`\`

**优化**：如果某一轮没有发生任何交换，说明数组已经有序，可以提前终止。这就是为什么冒泡排序在最好情况下是 O(n)。

### 选择排序 (Selection Sort)

选择排序每次从未排序部分中找到最小元素，放到已排序部分的末尾。

**算法步骤**：
1. 在未排序部分中找到最小元素
2. 将它与未排序部分的第一个元素交换
3. 已排序部分扩大一个元素，重复上述过程

\`\`\`
初始: [5, 3, 8, 1, 2]

第1轮: [1, 3, 8, 5, 2]  -- 找到最小值1，与第1个交换
第2轮: [1, 2, 8, 5, 3]  -- 找到最小值2，与第2个交换
第3轮: [1, 2, 3, 5, 8]  -- 找到最小值3，与第3个交换
第4轮: [1, 2, 3, 5, 8]  -- 只剩一个元素，排序完成
\`\`\`

选择排序的特点是交换次数最少（最多 n-1 次），但比较次数固定为 O(n²)，因此无论数据是否有序，时间复杂度都是 O(n²)。

### 插入排序 (Insertion Sort)

插入排序的工作方式类似于整理扑克牌：每次取一张牌，插入到手中已排好序的牌的正确位置。

**算法步骤**：
1. 从第二个元素开始，将当前元素视为"待插入"的元素
2. 将它与前面已排序的元素逐一比较
3. 找到正确位置后插入

\`\`\`
初始: [5, 3, 8, 1, 2]

第1步: [3, 5, 8, 1, 2]  -- 将3插入到5前面
第2步: [3, 5, 8, 1, 2]  -- 8已在正确位置
第3步: [1, 3, 5, 8, 2]  -- 将1插入到最前面
第4步: [1, 2, 3, 5, 8]  -- 将2插入到1和3之间
\`\`\`

插入排序在近乎有序的数组上表现极佳（接近 O(n)），也适合小规模数据。许多高级排序算法（如 Timsort、Introsort）在小规模子数组上会切换到插入排序。

### 归并排序 (Merge Sort)

归并排序采用**分治法**（Divide and Conquer）：将数组不断对半分割，直到每部分只有一个元素，然后将有序的子数组两两合并。

**算法步骤**：
1. **分割**：将数组从中间分成两半
2. **递归**：对左右两半分别排序
3. **合并**：将两个有序子数组合并为一个有序数组

\`\`\`
        [5, 3, 8, 1, 2]
       /                \\
   [5, 3, 8]        [1, 2]
   /       \\          /   \\
 [5, 3]   [8]      [1]   [2]
 /   \\
[5]  [3]

--- 合并过程（自底向上） ---

[3, 5]  [8]        [1]   [2]
   \\    /             \\   /
  [3, 5, 8]         [1, 2]
       \\              /
    [1, 2, 3, 5, 8]
\`\`\`

合并两个有序数组是归并排序的核心操作：用两个指针分别指向两个子数组的开头，每次取较小的元素放入结果数组。

归并排序的优势在于**时间复杂度稳定**——无论数据分布如何，始终是 O(n log n)。缺点是需要 O(n) 的额外空间来合并。

### 快速排序 (Quick Sort)

快速排序是实际应用中最常用的排序算法。它也采用分治法，但思路与归并排序相反：归并排序是"先分后排"，快速排序是"边分边排"。

**算法步骤**：
1. **选择枢轴（Pivot）**：从数组中选择一个元素作为基准
2. **分区（Partition）**：将数组分为两部分——小于枢轴的元素在左边，大于枢轴的元素在右边
3. **递归**：对左右两部分分别进行快速排序

\`\`\`
初始: [5, 3, 8, 1, 2]  选择枢轴 = 3

分区:  [1, 2] [3] [5, 8]
       小于3   枢轴  大于3

递归排序左右两部分:
       [1, 2] [3] [5, 8]
          \\         \\
       [1, 2] [3] [5, 8]

结果: [1, 2, 3, 5, 8]
\`\`\`

**枢轴选择策略**：
- 取第一个或最后一个元素（简单但可能触发最坏情况）
- 取中间元素（较好的实践）
- 三数取中（Median of Three）：取首、中、尾三个元素的中位数
- 随机选择（避免最坏情况的概率极高）

**Lomuto 分区方案**：维护一个指针 i，使得 [left, i] 都小于枢轴。遍历数组，遇到小于枢轴的元素就与 i+1 位置交换。

**Hoare 分区方案**：从两端向中间扫描，左边找大于枢轴的，右边找小于枢轴的，交换。通常比 Lomuto 更高效。

快速排序的平均时间复杂度为 O(n log n)，常数因子小，缓存局部性好，因此实际运行速度通常优于归并排序和堆排序。

## 可视化说明

在可视化面板中，排序过程以柱状图的形式直观展示：

- **柱子高度**代表元素值的大小
- **黄色**表示正在比较的两个元素
- **红色**表示正在进行交换操作
- **绿色**表示已经排好序的元素
- **蓝色**表示快速排序中选择的枢轴元素

你可以通过控制栏选择不同的排序算法，调整播放速度，逐步观察每一步的比较和交换操作。还可以随机生成新数组，对比不同算法在相同数据上的表现差异。

## 常见错误

### 1. 快速排序分区中的越界错误

\`\`\`typescript
// 错误：循环条件不正确，可能越界
while (i <= j) {
  while (arr[i] <= pivot) i++   // i 可能越界！
  while (arr[j] >= pivot) j--   // j 可能越界！
  if (i <= j) swap(arr, i, j)
}

// 正确：加入边界检查
while (i <= j) {
  while (i <= j && arr[i] <= pivot) i++
  while (i <= j && arr[j] >= pivot) j--
  if (i <= j) swap(arr, i, j)
}
\`\`\`

### 2. 不稳定排序破坏相等元素的顺序

\`\`\`typescript
// 场景：先按成绩排序，再按姓名排序
// 如果第二次排序使用不稳定算法（如快速排序），
// 第一次排序的结果可能被破坏

// 解决方案1：使用稳定排序（如归并排序）
// 解决方案2：自定义比较器同时考虑两个字段
students.sort((a, b) => {
  if (a.name !== b.name) return a.name.localeCompare(b.name)
  return a.score - b.score  // 名字相同时保持成绩顺序
})
\`\`\`

### 3. 快速排序选择糟糕的枢轴

\`\`\`typescript
// 错误：总是选第一个元素作为枢轴
// 对已排序数组会退化为 O(n²)
function partition(arr, left, right) {
  const pivot = arr[left]  // 糟糕的选择！
  // ...
}

// 正确：三数取中法
function medianOfThree(arr, left, right) {
  const mid = (left + right) >> 1
  if (arr[left] > arr[mid]) [arr[left], arr[mid]] = [arr[mid], arr[left]]
  if (arr[left] > arr[right]) [arr[left], arr[right]] = [arr[right], arr[left]]
  if (arr[mid] > arr[right]) [arr[mid], arr[right]] = [arr[right], arr[mid]]
  return mid  // 返回中位数的索引
}
\`\`\`

### 4. 归并排序的合并逻辑错误

\`\`\`typescript
// 错误：忘记处理剩余元素
function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }
  // 忘记处理 left 或 right 中剩余的元素！
  return result
}

// 正确：将剩余元素追加到结果中
function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j))
}
\`\`\`

## 实际应用

### 数据库排序

数据库的 ORDER BY、GROUP BY、索引构建底层都依赖排序算法。MySQL 的 InnoDB 使用改进的归并排序进行外部排序。PostgreSQL 使用多种排序策略的组合。

### 搜索引擎

搜索引擎需要对搜索结果按相关性排序。Google 的 PageRank 算法本质上就是对网页按权重排序。Top-K 问题（只取前 K 个结果）常用堆排序或快速选择算法。

### 数据分析

数据分析中，排序是计算统计量（中位数、百分位数）的基础。数据清洗中的去重操作也需要先排序。排序后的数据还可以加速范围查询和区间统计。

### 竞赛编程

在算法竞赛中，排序经常作为预处理步骤。自定义比较器可以实现复杂的排序需求：按多个字段排序、按绝对值排序、按字符串的特定规则排序等。

### 操作系统

操作系统使用排序来管理进程调度（按优先级排序）、文件系统（按文件名或修改时间排序）、内存管理（按地址排序合并空闲块）。

### 工程实践中的排序选择

- **小规模数据（n < 50）**：插入排序，常数因子小，实现简单
- **通用排序**：快速排序或其改进版本（Introsort）
- **需要稳定排序**：归并排序或 Timsort
- **外部排序（数据量超出内存）**：多路归并排序
- **整数排序**：计数排序或基数排序，可以达到 O(n)

## 总结

排序算法是计算机科学的基石。以下是各算法的特点总结：

| 算法 | 时间（平均） | 空间 | 稳定 | 适用场景 |
|------|------------|------|------|---------|
| 冒泡排序 | O(n²) | O(1) | 是 | 教学演示，小规模近乎有序数据 |
| 选择排序 | O(n²) | O(1) | 否 | 交换成本高时（如大对象） |
| 插入排序 | O(n²) | O(1) | 是 | 小规模数据，近乎有序数据 |
| 归并排序 | O(n log n) | O(n) | 是 | 需要稳定排序，链表排序，外部排序 |
| 快速排序 | O(n log n) | O(log n) | 否 | 通用排序，实际性能最优 |

选择排序算法时，需要考虑以下因素：
1. **数据规模**：小规模用插入排序，大规模用快速排序或归并排序
2. **是否需要稳定**：需要稳定则选择归并排序或插入排序
3. **数据特征**：近乎有序用插入排序，大量重复元素用三路快排
4. **空间限制**：空间受限用快速排序或堆排序

理解每种排序算法的原理和特性，能帮助你在实际工程中做出最优选择。排序算法也是学习分治、递归、动态规划等高级算法思想的绝佳入口。`,Sh=wh(kh);te.register("sorting",{metadata:yh,articleHtml:Sh,quiz:vh,getVisualization:()=>x(()=>import("./visualization-CIT7IuKM.js"),[]),getDemo:()=>x(()=>import("./demo-bt8YQMyc.js"),[])});const _h="shortest-path",Oh="最短路径",xh="在加权图中找到两点间最短路径的 Dijkstra 算法",$h="树形结构",Eh="advanced",Ph=["图论","Dijkstra","贪心","优先队列"],jh=14,es={id:_h,title:Oh,description:xh,category:$h,difficulty:Eh,tags:Ph,order:jh},Ch=[{question:"Dijkstra 算法采用的核心策略是什么？",options:["动态规划","贪心算法","分治法","回溯法"],answer:1,explanation:"Dijkstra 算法采用贪心策略，每次从未访问的节点中选择距离源点最近的节点，然后对该节点的所有邻居执行松弛操作。这种局部最优选择最终导致全局最优解。"},{question:"Dijkstra 算法不能正确处理哪种情况？",options:["有向图","无向图","含负权边的图","稀疏图"],answer:2,explanation:"Dijkstra 算法不能正确处理含负权边的图。因为贪心策略假设一旦节点被标记为已访问，其最短距离就确定了，但负权边会破坏这个假设。对于含负权边的图，应使用 Bellman-Ford 算法。"},{question:"使用二叉堆实现的 Dijkstra 算法的时间复杂度是多少？",options:["O(V)","O(V²)","O((V+E) log V)","O(V log V + E)"],answer:2,explanation:"使用二叉堆（优先队列）实现的 Dijkstra 算法时间复杂度为 O((V+E) log V)，其中 V 是顶点数，E 是边数。如果不使用优先队列，而是每次线性扫描找最小距离节点，时间复杂度为 O(V²)。"},{question:"在 Dijkstra 算法中，松弛操作的目的是什么？",options:["删除图中的边","更新节点的最短距离估计","标记节点为已访问","选择下一个要访问的节点"],answer:1,explanation:"松弛操作的目的是更新节点的最短距离估计。对于边 (u, v)，如果从源点经过 u 到达 v 的距离比当前已知的到 v 的距离更短，则更新 v 的距离值。这是 Dijkstra 算法的核心操作。"},{question:"以下哪个不是 Dijkstra 算法的实际应用场景？",options:["GPS 导航系统","网络路由协议","加密算法","游戏路径规划"],answer:2,explanation:"Dijkstra 算法广泛应用于 GPS 导航、网络路由、游戏路径规划等场景，但不直接用于加密算法。加密算法通常使用数论、代数等数学基础，而非图论中的最短路径算法。"}],Th=`# 最短路径 (Shortest Path / Dijkstra)

## 概念解释

在图论中，**最短路径问题**是指在加权图中找到两个顶点之间总权重最小的路径。这是计算机科学中最经典且应用广泛的问题之一。

### 核心概念

**加权图 (Weighted Graph)**
加权图是每条边都附带一个数值（权重）的图。权重可以表示距离、时间、成本等实际意义。例如在地图应用中，边的权重可以表示两个地点之间的实际距离或预计行驶时间。

**最短路径 (Shortest Path)**
从源点到目标点的所有可能路径中，边权重之和最小的那条路径。最短路径可能不唯一，但最短距离是唯一的。

**松弛操作 (Relaxation)**
松弛是 Dijkstra 算法的核心操作。对于边 (u, v)，如果从源点经过 u 到达 v 的距离比当前已知的到 v 的距离更短，则更新 v 的距离值。用数学表达式表示：
\`\`\`
if dist[u] + weight(u, v) < dist[v]:
    dist[v] = dist[u] + weight(u, v)
\`\`\`

**贪心策略 (Greedy Approach)**
Dijkstra 算法采用贪心策略：每次从未访问的节点中选择距离源点最近的节点，然后对该节点的所有邻居执行松弛操作。这种局部最优选择最终导致全局最优解。

## 为什么重要

最短路径算法在现实世界中有广泛的应用：

- **GPS 导航系统**：计算从起点到终点的最快或最短路线
- **网络路由协议**：OSPF、IS-IS 等协议使用最短路径算法转发数据包
- **游戏路径规划**：NPC 和玩家的自动寻路功能
- **物流优化**：快递配送路线规划，降低运输成本
- **社交网络分析**：计算用户之间的"六度分隔"距离
- **航班票价系统**：找到最便宜的航班组合

## 核心原理

### Dijkstra 算法

Dijkstra 算法由荷兰计算机科学家 Edsger W. Dijkstra 于 1956 年提出，适用于**边权重非负**的加权图。

#### 算法步骤

1. **初始化**：
   - 创建距离数组 \`dist[]\`，将源点距离设为 0，其他节点设为无穷大
   - 创建已访问集合 \`visited\`，初始为空
   - 创建优先队列（最小堆），将源点加入

2. **主循环**：
   - 从优先队列中取出距离最小的未访问节点 u
   - 将 u 标记为已访问
   - 对 u 的每个邻居 v 执行松弛操作：
     - 如果 \`dist[u] + weight(u, v) < dist[v]\`，则更新 \`dist[v]\`
     - 将 v 加入优先队列

3. **终止条件**：
   - 优先队列为空，或目标节点已被访问

#### 时间复杂度

| 实现方式 | 时间复杂度 | 说明 |
|---------|-----------|------|
| 数组实现 | O(V²) | 每次线性扫描找最小距离节点 |
| 二叉堆实现 | O((V+E) log V) | 推荐实现方式 |
| 斐波那契堆实现 | O(V log V + E) | 理论最优，实际较少使用 |

其中 V 是顶点数，E 是边数。

#### 空间复杂度

O(V + E)，需要存储图的邻接表、距离数组和优先队列。

### 算法示例

考虑以下加权图：
\`\`\`
      2
  A -------> B
  |         /|\\
  | 1      / | \\ 4
  |       /  |  \\
  v      /   |   v
  C ---3---->D--->E
       1    2
\`\`\`

从源点 A 开始的 Dijkstra 执行过程：

1. 初始：dist[A]=0, dist[B]=∞, dist[C]=∞, dist[D]=∞, dist[E]=∞
2. 访问 A：松弛邻居 B(0+2<∞)→dist[B]=2, C(0+1<∞)→dist[C]=1
3. 访问 C（最小未访问）：松弛邻居 D(1+3<∞)→dist[D]=4
4. 访问 B：松弛邻居 D(2+1<4)→dist[D]=3, E(2+4<∞)→dist[E]=6
5. 访问 D：松弛邻居 E(3+2<6)→dist[E]=5
6. 访问 E：无未访问邻居
7. 最终：dist[A]=0, dist[B]=2, dist[C]=1, dist[D]=3, dist[E]=5

## 可视化说明

通过可视化可以直观理解 Dijkstra 算法的执行过程：

1. **节点状态**：
   - 蓝色：当前正在处理的节点
   - 绿色：已完成处理的节点
   - 灰色：未访问的节点

2. **距离标签**：
   - 每个节点上显示当前已知的最短距离
   - 初始时源点为 0，其他为 ∞
   - 随着算法执行，距离值会不断更新

3. **边的高亮**：
   - 红色边：当前正在检查的边（松弛操作）
   - 绿色边：最终最短路径上的边

4. **优先队列**：
   - 显示队列中的节点及其距离值
   - 队首元素是下一个将被处理的节点

## 常见错误

### 1. 对负权边使用 Dijkstra 算法

**错误原因**：Dijkstra 的贪心策略假设一旦节点被标记为已访问，其最短距离就确定了。负权边会破坏这个假设。

**示例**：
\`\`\`
A --1--> B
A --5--> C
B --(-3)--> C
\`\`\`
Dijkstra 会先访问 B（距离 1），然后访问 C（距离 5）。但实际上 A→B→C 的距离是 1+(-3)=-2，更短。

**解决方案**：使用 Bellman-Ford 算法处理含负权边的图。

### 2. 不使用优先队列导致效率低下

**错误实现**：每次都遍历所有节点找最小距离节点，时间复杂度为 O(V²)。

**正确实现**：使用最小堆（优先队列），时间复杂度优化为 O((V+E) log V)。

### 3. 忘记标记节点为已访问

**错误原因**：如果不标记已访问节点，可能会重复处理同一节点，导致无限循环或错误结果。

**正确做法**：每次从优先队列取出节点后，立即标记为已访问。

### 4. 未正确处理不可达节点

**错误表现**：算法结束后，不可达节点的距离值仍为无穷大，但代码未做相应处理。

**正确做法**：检查 dist 数组，对无穷大的值进行特殊处理。

## 实际应用

### 1. Google Maps 路径规划

Google Maps 使用改进的 Dijkstra 算法（结合 A* 算法）来计算路线。考虑因素包括：
- 实时交通状况（动态权重）
- 道路类型（高速公路、城市道路）
- 用户偏好（最短距离 vs 最快时间）

### 2. 网络数据包路由

OSPF（开放最短路径优先）协议使用 Dijkstra 算法：
- 每个路由器维护完整的网络拓扑
- 定期运行 Dijkstra 算法更新路由表
- 数据包沿着最短路径转发

### 3. 航空票价优化

航空公司的票价系统使用最短路径算法：
- 城市作为节点，航线作为边
- 边权重为票价或飞行时间
- 找到最便宜或最快的航班组合

### 4. 社交网络分析

在社交网络中计算用户之间的距离：
- 用户作为节点，关注/好友关系作为边
- 计算两个用户之间的最短连接路径
- 用于"你可能认识的人"推荐功能

## 总结

Dijkstra 算法是最短路径问题的经典解决方案，其核心思想是贪心策略：每次选择距离源点最近的未访问节点，逐步扩展最短路径树。

**关键要点**：
- 适用于边权重非负的加权图
- 使用优先队列可优化至 O((V+E) log V) 时间复杂度
- 松弛操作是算法的核心，用于更新最短距离估计
- 实际应用中常与 A* 算法结合，使用启发式函数加速搜索

**适用场景**：
- 单源最短路径问题
- 边权重非负的图
- 需要精确计算最短距离的场景

**局限性**：
- 不能处理负权边
- 对于稠密图，O(V²) 的数组实现可能更高效
- 不适用于需要计算所有节点对之间最短路径的场景（应使用 Floyd-Warshall 算法）

通过深入理解 Dijkstra 算法的原理和实现，可以更好地应用它解决实际问题，并为学习更复杂的图算法奠定基础。`,ns={...es,difficulty:es.difficulty},Dh=Ch;function Ah(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(l=>l.trim());return i.every(l=>/^[-:]+$/.test(l))?"<!-- table separator -->":`<tr>${i.map(l=>`<td>${l}</td>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(ns.id,{metadata:ns,articleHtml:Ah(Th),quiz:Dh,getVisualization:()=>x(()=>import("./visualization-5zwzeXxD.js"),[]),getDemo:()=>x(()=>import("./demo-BNyj1xnf.js"),[])});const Lh="binary-search",zh="二分查找",Nh="在有序数组中以 O(log n) 时间查找目标值的经典算法",Fh="搜索算法",Mh="beginner",Rh=["查找","分治","O(logn)"],Bh=11,ts={id:Lh,title:zh,description:Nh,category:Fh,difficulty:Mh,tags:Rh,order:Bh},Ih=[{question:"二分查找的时间复杂度是多少？",options:["O(1)","O(log n)","O(n)","O(n log n)"],answer:1,explanation:"二分查找每一步都将搜索范围缩小一半，因此时间复杂度为 O(log n)。对于一个包含 n 个元素的数组，最多需要 log₂(n) 次比较即可找到目标值或确认其不存在。例如，一个包含 100 万个元素的数组，最多只需要约 20 次比较。"},{question:"在标准二分查找中，计算中间位置 mid 时，以下哪种方式可以避免整数溢出？",options:["mid = (left + right) / 2","mid = left + (right - left) / 2","mid = right - left / 2","mid = (left * right) / 2"],answer:1,explanation:"当 left 和 right 都很大时，left + right 可能超出整数范围导致溢出。使用 left + (right - left) / 2 可以避免这个问题，因为 right - left 的结果一定在安全范围内。在 Java、C++ 等语言中这是一个重要的注意事项，JavaScript 中的数字是浮点数，溢出风险较小，但这是良好的编程习惯。"},{question:"二分查找对输入数据有什么要求？",options:["数据必须存储在链表中","数据必须是有序的","数据必须是整数类型","数据元素必须互不相同"],answer:1,explanation:"二分查找的核心前提是数据必须是有序的（通常为升序）。如果数据无序，二分查找无法正确判断应该向左还是向右缩小搜索范围。此外，二分查找需要支持随机访问（通过索引直接访问元素），因此数组是理想的存储结构，链表不适合。"},{question:"在二分查找中，当 left == right 且 arr[left] != target 时，会发生什么？",options:["程序会进入死循环","搜索范围为空，循环结束，返回未找到","自动扩展搜索范围","抛出异常"],answer:1,explanation:"当 left == right 且该位置的值不等于目标值时，说明搜索范围已经缩小到仅剩一个元素且不匹配。在下一次迭代中，根据比较结果，left 或 right 会越过对方（left > right），导致循环条件 left <= right 不再满足，循环正常结束。这是二分查找的正确终止条件。"},{question:"以下哪种场景最适合使用二分查找？",options:["在无序链表中查找元素","在已排序的数组中查找某个值第一次出现的位置","在动态数组中频繁插入和删除元素","遍历二维矩阵的所有元素"],answer:1,explanation:"二分查找适用于有序数组中的查找场景。查找第一次出现的位置是二分查找的经典变体——当找到目标值时，不立即返回，而是继续向左缩小范围，直到找到最左边的匹配。无序链表无法使用二分查找（既无序又不支持随机访问），频繁插入删除不是二分查找的强项。"}],Vh=`# 二分查找 (Binary Search)

## 概念解释

二分查找（Binary Search）是一种在**有序数组**中查找目标值的高效算法。它的核心思想非常简单：每次将搜索范围缩小一半，直到找到目标值或确认目标值不存在。

想象一下你在翻字典：如果你想查"苹果"这个词，你不会从第一页开始逐页翻找，而是直接翻到字典中间，看看中间的词是比"苹果"靠前还是靠后，然后排除掉一半的页面，再在剩下的部分重复这个过程。这就是二分查找的本质。

### 前提条件

- 数组必须是**有序的**（通常为升序）
- 数组必须支持**随机访问**（通过索引直接访问元素，数组满足，链表不满足）

### 核心术语

| 术语 | 说明 |
|------|------|
| 搜索空间 (Search Space) | 当前可能包含目标值的数组范围，用 left 和 right 表示 |
| 中间位置 (Mid) | 搜索空间的中间索引，mid = left + (right - left) / 2 |
| 循环不变量 (Loop Invariant) | 目标值（如果存在）一定在 [left, right] 区间内 |

## 为什么重要

### 1. O(log n) 的惊人效率

二分查找的时间复杂度是 O(log n)，这意味着：

- 100 个元素最多需要 7 次比较
- 1,000 个元素最多需要 10 次比较
- 1,000,000 个元素最多需要 20 次比较
- 10 亿个元素最多只需要 30 次比较！

相比之下，线性查找 O(n) 在 10 亿个元素时最坏需要 10 亿次比较。这种指数级的效率差距在大规模数据中至关重要。

### 2. 许多算法的基础

二分查找不仅仅是一个独立的算法，它还是许多高级算法和数据结构的基础：

- **二叉搜索树 (BST)**：每个节点的左子树都小于它，右子树都大于它，本质上就是二分查找的树形表示
- **B 树 / B+ 树**：数据库索引的核心数据结构，利用了二分查找的思想
- **分治算法**：很多分治算法在合并阶段使用二分查找来优化

### 3. 数据库索引的核心

当你执行 \`SELECT * FROM users WHERE id = 12345\` 时，数据库不是逐行扫描，而是通过 B+ 树索引进行类似二分查找的操作，将查找时间从 O(n) 降低到 O(log n)。

### 4. 工程中的广泛应用

从调试工具 \`git bisect\` 到操作系统的内存分配，从游戏中的碰撞检测到机器学习中的超参数搜索，二分查找无处不在。

## 核心原理

### 标准二分查找

二分查找使用两个指针 \`left\` 和 \`right\` 来维护搜索空间的边界：

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      return mid           // 找到目标
    } else if (arr[mid] < target) {
      left = mid + 1       // 目标在右半部分
    } else {
      right = mid - 1      // 目标在左半部分
    }
  }

  return -1  // 未找到
}
\`\`\`

### 执行过程详解

以数组 \`[1, 3, 5, 7, 9, 11, 13, 15]\` 查找目标值 \`7\` 为例：

\`\`\`
第 1 步: left=0, right=7, mid=3
         [1, 3, 5, 7, 9, 11, 13, 15]
                   ^
         arr[3]=7 == target → 找到！返回 3

如果目标是 11:

第 1 步: left=0, right=7, mid=3
         [1, 3, 5, 7, 9, 11, 13, 15]
                   ^
         arr[3]=7 < 11 → 搜索右半部分, left=4

第 2 步: left=4, right=7, mid=5
         [1, 3, 5, 7, 9, 11, 13, 15]
                         ^
         arr[5]=11 == target → 找到！返回 5
\`\`\`

### 循环不变量

二分查找的关键在于维护一个**循环不变量**：如果目标值存在于数组中，那么它一定在 \`[left, right]\` 这个闭区间内。

- 初始化：\`left=0, right=n-1\`，整个数组都是搜索空间
- 保持：每次比较后，根据结果缩小范围，但目标值仍在区间内
- 终止：\`left > right\` 时，搜索空间为空，目标值不存在

### 查找第一次出现的位置

当数组中有重复元素时，找到目标值后不立即返回，而是继续向左搜索：

\`\`\`typescript
function findFirst(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (arr[mid] === target) {
      result = mid        // 记录位置，但继续向左搜索
      right = mid - 1
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}
\`\`\`

### 查找插入位置

查找目标值应该插入的位置（即第一个大于等于目标值的位置）：

\`\`\`typescript
function searchInsert(arr: number[], target: number): number {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}
\`\`\`

## 可视化说明

在可视化面板中，二分查找的过程以数组方块的形式直观展示：

- **蓝色**方块表示当前搜索范围 \`[left, right]\`
- **红色**方块表示当前正在比较的中间位置 \`mid\`
- **绿色**方块表示已找到的目标值
- **灰色**方块表示已排除的区域

每一步都会显示：
- 当前的 left、right、mid 指针位置
- 中间值与目标值的比较结果
- 搜索范围如何缩小

通过控制栏，你可以：
- 输入自定义的目标值
- 逐步执行或自动播放
- 调整播放速度
- 重置到初始状态

## 常见错误

### 1. 整数溢出

\`\`\`typescript
// 错误：当 left 和 right 都很大时可能溢出
const mid = (left + right) / 2

// 正确：避免溢出的写法
const mid = left + Math.floor((right - left) / 2)
\`\`\`

在 Java、C++ 等语言中，\`left + right\` 可能超出 \`int\` 范围。虽然 JavaScript 的数字是浮点数，不容易溢出，但养成好习惯很重要。

### 2. 边界条件错误（off-by-one）

\`\`\`typescript
// 错误：使用 left < right 作为循环条件（闭区间写法）
while (left < right) { ... }  // 可能漏掉 left == right 的情况

// 正确：闭区间写法应使用 left <= right
while (left <= right) { ... }
\`\`\`

循环条件取决于区间的定义：
- **闭区间 [left, right]**：使用 \`left <= right\`，初始 \`right = n - 1\`
- **左闭右开 [left, right)**：使用 \`left < right\`，初始 \`right = n\`

两种写法都可以，但必须保持一致，混用会导致死循环或漏查。

### 3. 死循环

\`\`\`typescript
// 错误：当 left == right 时 mid 始终等于 left，无法缩小范围
while (left < right) {
  const mid = left + Math.floor((right - left) / 2)
  if (arr[mid] < target) {
    left = mid       // 应该是 mid + 1！
  } else {
    right = mid
  }
}

// 正确：确保搜索范围在每次迭代中缩小
if (arr[mid] < target) {
  left = mid + 1    // 排除 mid
} else {
  right = mid       // mid 可能是答案，保留
}
\`\`\`

### 4. 忘记数组必须有序

\`\`\`typescript
// 错误：对无序数组使用二分查找
const arr = [3, 1, 4, 1, 5, 9, 2, 6]
binarySearch(arr, 5)  // 结果不可靠！

// 正确：先排序，或者确认数组已排序
const sorted = [...arr].sort((a, b) => a - b)
binarySearch(sorted, 5)
\`\`\`

### 5. 混淆开区间和闭区间的写法

\`\`\`typescript
// 闭区间写法 [left, right]
let left = 0, right = arr.length - 1   // right = n - 1
while (left <= right) { ... }           // <=
// 更新时：left = mid + 1, right = mid - 1

// 左闭右开写法 [left, right)
let left = 0, right = arr.length       // right = n
while (left < right) { ... }           // <
// 更新时：left = mid + 1, right = mid
\`\`\`

两种写法都是正确的，关键是在整个函数中保持一致。

## 实际应用

### 1. 字典查找

二分查找最直观的应用就是字典查找。纸质字典的编排方式就是有序的，我们翻字典时天然使用的就是二分查找的思想。

### 2. 数据库索引（B 树 / B+ 树）

数据库的 B+ 树索引在每个节点中存储多个有序的键值，查找时在节点内部使用二分查找来确定应该走哪个子树。这使得数据库查询可以在 O(log n) 时间内完成。

### 3. git bisect

Git 提供了 \`git bisect\` 命令，用于在提交历史中定位引入 bug 的提交。它使用二分查找的思想：先检出中间的提交，测试是否有 bug，然后排除一半的提交，重复直到找到问题提交。对于 1000 个提交，只需要约 10 次测试。

### 4. 旋转数组查找

一个经典的面试题：在一个旋转后的有序数组（如 \`[4, 5, 6, 7, 0, 1, 2]\`）中查找目标值。解决方法是在标准二分查找的基础上，判断 mid 落在哪个有序段，然后决定搜索方向。

\`\`\`typescript
function searchRotated(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) return mid

    // 判断哪半部分是有序的
    if (nums[left] <= nums[mid]) {
      // 左半部分有序
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    } else {
      // 右半部分有序
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
  }
  return -1
}
\`\`\`

### 5. 查找边界

二分查找可以用来查找满足条件的边界值：

- **查找第一个满足条件的位置**：找到满足条件的最左位置
- **查找最后一个满足条件的位置**：找到满足条件的最右位置

这类问题在实际工程中非常常见，例如查找某个时间范围内的第一条记录、查找某个价格区间内的第一个商品等。

### 6. 浮点数二分

二分查找不仅适用于整数，还可以用于浮点数，例如求平方根：

\`\`\`typescript
function sqrt(n: number): number {
  let left = 0, right = n
  while (right - left > 1e-9) {
    const mid = (left + right) / 2
    if (mid * mid < n) {
      left = mid
    } else {
      right = mid
    }
  }
  return left
}
\`\`\`

## 总结

二分查找是计算机科学中最基础、最实用的算法之一：

**核心思想**：在有序数组中，每次将搜索范围缩小一半，直到找到目标或确认不存在。

**时间复杂度**：O(log n) —— 对数级别，极其高效。

**空间复杂度**：O(1) —— 只需要几个变量。

**关键要点**：

- 前提条件：数组必须有序且支持随机访问
- 边界处理：明确区间的开闭定义，保持写法一致
- 避免溢出：使用 \`left + (right - left) / 2\` 计算中点
- 循环不变量：目标值始终在 \`[left, right]\` 区间内
- 变体丰富：查找第一个/最后一个、查找插入位置、旋转数组查找等

掌握二分查找不仅是学习更高级数据结构（二叉搜索树、B 树、跳表等）的基础，也是解决大量算法题和工程问题的核心工具。理解其原理并注意边界细节，将使你在面对有序数据的查找问题时游刃有余。
`,rs={...ts,difficulty:ts.difficulty},Hh=Ih;function Wh(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(l=>l.trim());return i.every(l=>/^[-:]+$/.test(l))?"<!-- table separator -->":`<tr>${i.map(l=>`<td>${l}</td>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(rs.id,{metadata:rs,articleHtml:Wh(Vh),quiz:Hh,getVisualization:()=>x(()=>import("./visualization-BAdCgguE.js"),[]),getDemo:()=>x(()=>import("./demo-BsMcHisJ.js"),[])});const Uh="string-matching",qh="字符串匹配",Kh="在文本中高效查找模式串的算法，包含暴力匹配和 KMP 算法",Qh="搜索算法",Yh="intermediate",Xh=["字符串","KMP","模式匹配"],Gh=12,is={id:Uh,title:qh,description:Kh,category:Qh,difficulty:Yh,tags:Xh,order:Gh},Jh=[{question:"暴力匹配（Brute Force）算法在最坏情况下的时间复杂度是多少？",options:["O(n)","O(n + m)","O(n × m)","O(n log m)"],answer:2,explanation:"暴力匹配在最坏情况下需要对文本的每个位置都进行完整的模式串比较。设文本长度为 n，模式串长度为 m，最坏情况下（例如文本为 'AAAAAA...A'，模式串为 'AAAAB'）需要比较 (n - m + 1) × m 次，即 O(n × m)。"},{question:"KMP 算法相比暴力匹配的最大优势是什么？",options:["KMP 不需要预处理，直接开始匹配","KMP 利用已匹配的信息避免回退文本指针，实现 O(n+m) 时间复杂度","KMP 使用更少的内存空间","KMP 可以处理多个模式串同时匹配"],answer:1,explanation:"KMP 的核心优势在于：当发生不匹配时，它利用已经匹配的部分（通过失败函数/next 数组）来决定模式串应该向右滑动多远，而不需要回退文本指针 i。这使得文本中的每个字符最多被比较两次，总时间复杂度降为 O(n+m)，其中 O(m) 是预处理失败函数的代价。"},{question:"KMP 算法中的失败函数（failure function / next 数组）的作用是什么？",options:["记录文本中每个字符的出现频率","记录模式串中每个位置的最长相等前后缀长度，用于决定失配时模式串的滑动距离","记录模式串中每个字符在文本中第一次出现的位置","记录模式串与文本的匹配程度"],answer:1,explanation:"失败函数 next[j] 记录的是模式串 P[0..j] 的最长相等真前缀和真后缀的长度。当在位置 j 发生失配时，我们不需要从头开始匹配，而是将模式串的指针回退到 next[j-1]，因为 P[0..next[j]-1] 这段前缀已经和文本中当前位置之前的相应部分匹配了，可以跳过这些不必要的比较。"},{question:"在以下哪种场景中，KMP 算法的优势最为明显？",options:["在随机字符串中查找随机模式串","在包含大量重复字符的文本中查找包含重复字符的模式串（如在 'AAAAAAB' 中查找 'AAAAB'）","模式串长度为 1 时","文本长度远小于模式串长度时"],answer:1,explanation:"当文本和模式串都包含大量重复字符时，暴力匹配在每次失配后只能将模式串右移一位，导致大量重复比较。而 KMP 利用失败函数可以跳过大量已经匹配过的位置。例如在 'AAAAAAAB' 中查找 'AAAAB'，暴力匹配需要 O(n×m) 次比较，而 KMP 只需要 O(n+m) 次。"},{question:"关于 KMP 算法中 next 数组的实现，以下哪种做法是正确的？",options:["next[0] 初始化为 1，表示第一个字符失配时跳到第二个字符","next[0] 初始化为 -1（或 0，取决于实现），表示第一个字符就失配时无法回退","next 数组的值可以大于模式串的长度","next 数组不需要预处理，在匹配过程中动态计算"],answer:1,explanation:"在常见的 KMP 实现中，next[0] 通常初始化为 -1（使用 0-indexed 的版本）或 0（使用 1-indexed 的版本），表示当模式串的第一个字符就与文本不匹配时，没有更短的前后缀可以利用，应该将文本指针右移一位。next 数组的值永远不会超过当前已处理的前缀长度，必须通过预处理阶段计算得出。"}],bh=`# 字符串匹配 (String Matching / KMP)

## 概念解释

字符串匹配是计算机科学中最基础的问题之一：给定一个**文本串 T**（长度为 n）和一个**模式串 P**（长度为 m），找出模式串 P 在文本串 T 中所有出现的位置。

### 核心术语

- **文本串 T（Text）**：被搜索的长字符串，长度记为 n
- **模式串 P（Pattern）**：要查找的目标字符串，长度记为 m（通常 m << n）
- **匹配（Match）**：当 T[i..i+m-1] = P[0..m-1] 时，称模式串在位置 i 处匹配成功
- **失配（Mismatch）**：在比较过程中发现 T[i+k] ≠ P[k]，当前位置匹配失败
- **失败函数 / next 数组（Failure Function）**：KMP 算法的核心，记录模式串中每个位置的最长相等前后缀长度

### 两种基本方法

**暴力匹配（Brute Force）**：对文本中每个可能的起始位置，逐字符比较模式串。时间复杂度为 O(n × m)。

**KMP 算法（Knuth-Morris-Pratt）**：利用已匹配的信息，在失配时智能地滑动模式串，避免重复比较。时间复杂度为 O(n + m)。

### 复杂度对比

| 算法 | 预处理时间 | 匹配时间 | 总时间复杂度 | 空间复杂度 |
|------|-----------|---------|-------------|-----------|
| 暴力匹配 | 无 | O(n × m) | O(n × m) | O(1) |
| KMP | O(m) | O(n) | O(n + m) | O(m) |

## 为什么重要

字符串匹配是计算机科学中应用最广泛的基础算法之一，几乎所有涉及文本处理的系统都离不开它：

### 文本编辑器的查找功能

当你在 VS Code、Sublime Text 或 Word 中按下 Ctrl+F 搜索关键词时，底层就是在执行字符串匹配。编辑器需要在可能有数百万字符的文档中快速定位目标字符串。

### 搜索引擎

Google、百度等搜索引擎需要在海量网页中查找关键词。虽然现代搜索引擎使用了更复杂的索引结构，但字符串匹配仍然是核心基础——倒排索引的构建和查询都依赖高效的字符串处理。

### DNA 序列分析

生物信息学中，DNA 序列由 A、T、G、C 四种碱基组成。科学家需要在长达数十亿碱基对的基因组中查找特定的基因片段，这对字符串匹配算法的效率提出了极高的要求。

### 网络安全与入侵检测

入侵检测系统（IDS）需要实时监控网络数据包，在流量中匹配已知的恶意签名。这类场景往往需要同时匹配数千个模式串（如 Aho-Corasick 算法），但其基础仍然是单模式串匹配。

### 拼写检查与自动补全

拼写检查器需要在词典中查找最接近的匹配；IDE 的代码自动补全也需要在代码库中搜索匹配的标识符。这些功能的底层都涉及字符串匹配的思想。

## 核心原理

### 暴力匹配（Brute Force）

暴力匹配是最直观的方法：将模式串与文本串从左到右逐一对齐比较。

**算法步骤**：
1. 将模式串 P 的起始位置对齐文本串 T 的位置 i（i 从 0 开始）
2. 从左到右逐字符比较 T[i+j] 和 P[j]
3. 如果所有 m 个字符都匹配成功，在位置 i 处找到一个匹配
4. 如果在某个位置失配，将 i 右移一位，从头开始比较 P
5. 重复上述过程直到 i > n - m

\`\`\`
文本 T: A B A B C A B A B C A B D
模式 P: A B A B C A B D

第1次对齐 (i=0):
  A B A B C A B A B C A B D
  A B A B C A B D
  ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✗  (第8个字符失配)

第2次对齐 (i=1):
  A B A B C A B A B C A B D
    A B A B C A B D
  ✗  (第1个字符就失配)

...以此类推，直到找到匹配位置 i=5
\`\`\`

**问题**：暴力匹配在每次失配后，只将模式串右移一位。这意味着文本指针 i 会不断回退，导致大量重复比较。最坏情况下时间复杂度为 O(n × m)。

### KMP 算法的核心思想

KMP 算法的精髓在于：**文本指针 i 永远不回退**。当在位置 j 发生失配时，利用已经匹配的部分信息，计算出模式串应该向右滑动多远。

关键观察：如果我们在匹配过程中发现 P[0..j-1] 已经和文本匹配了，而 P[0..j-1] 本身有一个长度为 k 的相等前后缀（即 P[0..k-1] = P[j-k..j-1]），那么我们可以直接将模式串向右滑动，让 P[k] 对齐当前文本位置，跳过 k 个不必要的比较。

### 失败函数（Failure Function / next 数组）

失败函数是 KMP 的预处理步骤，它为模式串的每个位置 j 计算一个值 \`fail[j]\`，表示 P[0..j] 的最长相等真前缀和真后缀的长度。

\`\`\`
模式串 P: A B A B C A B D

位置 j:     0  1  2  3  4  5  6  7
P[j]:       A  B  A  B  C  A  B  D
fail[j]:    0  0  1  2  0  1  2  0
\`\`\`

解释：
- \`fail[0] = 0\`：单个字符没有真前缀和真后缀
- \`fail[1] = 0\`："AB" 的真前缀 {A} 和真后缀 {B} 不相等
- \`fail[2] = 1\`："ABA" 的真前缀 {A, AB} 和真后缀 {A, BA}，最长相等的是 "A"，长度为 1
- \`fail[3] = 2\`："ABAB" 的真前缀和真后缀中，最长相等的是 "AB"，长度为 2
- \`fail[6] = 2\`："ABABCAB" 中，最长相等前后缀是 "AB"，长度为 2

### 失败函数的计算过程

\`\`\`
计算 fail[j] 的过程（使用双指针）：

初始化: i = 0, j = -1, fail[0] = -1
当 i < m 时循环:
  如果 j == -1 或 P[i] == P[j]:
    i++, j++
    fail[i] = j
  否则:
    j = fail[j]  // 回退到更短的前后缀
\`\`\`

### KMP 匹配过程

有了失败函数后，KMP 匹配过程就变得非常简单：

\`\`\`
初始化: i = 0（文本指针）, j = 0（模式串指针）
当 i < n 且 j < m 时循环:
  如果 j == -1 或 T[i] == P[j]:
    i++, j++  // 匹配成功，两个指针都前进
  否则:
    j = fail[j]  // 失配，利用失败函数滑动模式串
    // 注意：i 不回退！

如果 j == m:
  在位置 i - m 处找到匹配
\`\`\`

### KMP 匹配示例

\`\`\`
文本 T:   A B A B C A B A B C A B D
模式 P:   A B A B C A B D
fail:     0 0 1 2 0 1 2 0

步骤1: i=0,j=0  T[0]=A == P[0]=A  ✓  → i=1,j=1
步骤2: i=1,j=1  T[1]=B == P[1]=B  ✓  → i=2,j=2
步骤3: i=2,j=2  T[2]=A == P[2]=A  ✓  → i=3,j=3
步骤4: i=3,j=3  T[3]=B == P[3]=B  ✓  → i=4,j=4
步骤5: i=4,j=4  T[4]=C == P[4]=C  ✓  → i=5,j=5
步骤6: i=5,j=5  T[5]=A == P[5]=A  ✓  → i=6,j=6
步骤7: i=6,j=6  T[6]=B == P[6]=B  ✓  → i=7,j=7
步骤8: i=7,j=7  T[7]=A ≠ P[7]=D  ✗  → j=fail[6]=2 (滑动！)
步骤9: i=7,j=2  T[7]=A == P[2]=A  ✓  → i=8,j=3
...
\`\`\`

注意步骤8：当失配时，KMP 没有将 i 回退，而是利用失败函数将 j 从 7 跳到 2。因为 P[0..6] = "ABABCAB" 的最长相等前后缀长度为 2（"AB"），所以我们可以直接让 P[2] 对齐当前文本位置，跳过了前 2 个字符的比较。

## 可视化说明

在可视化面板中，字符串匹配的过程以字符方块的形式直观展示：

- **文本串**显示为一行字符方块，**模式串**显示在下方
- **绿色**表示当前字符匹配成功
- **红色**表示当前字符失配（mismatch）
- **蓝色**表示正在比较的字符对
- **灰色**表示已匹配过的部分
- 模式串会根据算法逻辑在文本下方左右滑动

通过控制栏，你可以：

- 在**暴力模式**和 **KMP 模式**之间切换，对比两者的差异
- 逐步观察每一次比较操作
- 调整动画速度
- 自定义输入文本串和模式串
- 查看总比较次数，直观感受效率差异

## 常见错误

### 1. 失败函数的 off-by-one 错误

\`\`\`typescript
// 错误：fail[i] 记录的是长度，不是索引
// 当 P[0..j] 的最长相等前后缀长度为 k 时
// fail[j+1] = k，不是 fail[j] = k
fail[0] = -1  // 或 0，取决于实现风格

// 正确：明确长度和索引的对应关系
// fail[i] 表示 P[0..i-1] 的最长相等前后缀长度
for (let i = 1; i < m; i++) {
  let j = fail[i - 1]
  while (j > 0 && P[i] !== P[j]) j = fail[j]
  if (P[i] === P[j]) j++
  fail[i] = j
}
\`\`\`

### 2. 未处理空模式串的边界情况

\`\`\`typescript
// 错误：空模式串会导致数组越界或死循环
function kmpSearch(text: string, pattern: string): number[] {
  const fail = buildFailureFunction(pattern)  // pattern 为空时出问题
  // ...
}

// 正确：加入边界检查
function kmpSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) return []
  if (text.length < pattern.length) return []
  // ...
}
\`\`\`

### 3. 混淆 0-indexed 和 1-indexed 的 next 数组

\`\`\`typescript
// 不同教材对 next 数组的定义可能不同：
// 0-indexed 版本：next[j] = P[0..j] 的最长相等前后缀长度
//   next[0] = 0（单个字符没有真前后缀）
// 1-indexed 版本：next[j] = 失配时应该回退到的位置
//   next[1] = 0（第一个字符就失配时回退到 0）

// 混淆两种实现会导致匹配结果错误
// 建议统一使用 0-indexed 版本，并在代码中明确注释
\`\`\`

### 4. 匹配循环中的指针回退错误

\`\`\`typescript
// 错误：KMP 匹配时回退了文本指针 i
while (i < n && j < m) {
  if (T[i] === P[j]) {
    i++; j++
  } else {
    i = i - j + 1  // 错误！这是暴力匹配的做法
    j = 0
  }
}

// 正确：KMP 中 i 永远不回退
while (i < n) {
  if (j === -1 || T[i] === P[j]) {
    i++; j++
  } else {
    j = fail[j]  // 只回退模式串指针
  }
}
\`\`\`

## 实际应用

### 文本编辑器的查找与替换

几乎所有文本编辑器都实现了查找功能。虽然现代编辑器可能使用更高级的算法（如 Boyer-Moore），但 KMP 作为最经典的线性时间匹配算法，是理解其他算法的基础。

\`\`\`typescript
// 简单的查找替换功能
function findAllOccurrences(text: string, pattern: string): number[] {
  const positions: number[] = []
  const fail = buildFailure(pattern)
  let j = 0
  for (let i = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== pattern[j]) j = fail[j - 1]
    if (text[i] === pattern[j]) j++
    if (j === pattern.length) {
      positions.push(i - j + 1)
      j = fail[j - 1]
    }
  }
  return positions
}
\`\`\`

### grep 命令

Linux 的 grep 命令用于在文件中搜索匹配指定模式的行。虽然 grep 使用正则表达式引擎，但其核心的字符串匹配部分借鉴了 KMP 等算法的思想。

### DNA 序列分析

在生物信息学中，研究人员经常需要在基因组数据库中查找特定的碱基序列。由于基因组数据量极大（人类基因组约 30 亿碱基对），高效的字符串匹配算法至关重要。

### 拼写检查器

拼写检查器不仅需要精确匹配，还需要在词典中查找最相似的单词。虽然这涉及编辑距离等更复杂的算法，但字符串匹配仍然是预处理阶段的重要步骤。

### 数据压缩

LZ77/LZ78 等压缩算法在查找重复子串时，本质上也是在做字符串匹配。高效的匹配算法可以显著提升压缩速度。

## 总结

字符串匹配是计算机科学中最基础、最实用的算法之一：

- **暴力匹配**：简单直观，时间复杂度 O(n × m)，适合短文本或简单场景
- **KMP 算法**：通过失败函数避免重复比较，时间复杂度 O(n + m)，是理解高级字符串算法的基础
- **失败函数**：KMP 的核心，记录模式串中每个位置的最长相等前后缀长度
- **关键思想**：文本指针 i 永远不回退，只通过失败函数滑动模式串

掌握字符串匹配算法，不仅能够解决实际工程中的文本搜索问题，更是学习后缀数组、AC 自动机、后缀树等高级字符串数据结构的必经之路。
`,ls={...is,difficulty:is.difficulty},Zh=Jh;function eg(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(l=>l.trim());return i.every(l=>/^[-:]+$/.test(l))?"<!-- table separator -->":`<tr>${i.map(l=>`<td>${l}</td>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(ls.id,{metadata:ls,articleHtml:eg(bh),quiz:Zh,getVisualization:()=>x(()=>import("./visualization-CXdBfHuc.js"),[]),getDemo:()=>x(()=>import("./demo-BEI4AeHp.js"),[])});const ng="union-find",tg="并查集",rg="高效处理不相交集合合并与查询的数据结构，常用于连通性判断",ig="树形结构",lg="intermediate",og=["集合","连通性","路径压缩","按秩合并"],ug=13,os={id:ng,title:tg,description:rg,category:ig,difficulty:lg,tags:og,order:ug},sg=[{question:"在并查集中，Find 操作的作用是什么？",options:["将两个集合合并为一个","确定一个元素所属集合的代表元素（根节点）","创建一个新的独立集合","计算集合中元素的数量"],answer:1,explanation:"Find 操作用于查找一个元素所属集合的代表元素（也叫根节点、集合标识）。两个元素属于同一个集合，当且仅当它们的 Find 返回相同的代表元素。Find 是并查集最核心的操作，路径压缩优化就作用于 Find 过程中。"},{question:"按秩合并（Union by Rank）的主要目的是什么？",options:["保证每次合并操作的时间复杂度为 O(1)","避免树过高，保持树的平衡，降低 Find 操作的时间复杂度","让合并后的集合元素按顺序排列","减少内存使用量"],answer:1,explanation:"按秩合并的核心思想是：合并时总是将较矮的树挂到较高的树下面。这样可以避免退化成链状结构（线性树），保持树的高度尽可能小。当不使用按秩合并时，连续合并可能导致树的高度为 O(n)，使 Find 操作退化为 O(n)。按秩合并保证树高最多为 O(log n)。"},{question:"路径压缩（Path Compression）是如何优化并查集的？",options:["在 Union 操作时直接连接两个根节点","在 Find 操作过程中，将路径上的所有节点直接指向根节点","删除不需要的边以减少树的高度","使用哈希表替代数组来存储父节点关系"],answer:1,explanation:"路径压缩在 Find 操作的递归过程中，将沿途经过的每一个节点的父节点直接设置为根节点。这样下次再查询这些节点时，只需要一步就能到达根节点。路径压缩不改变集合的正确性，但大幅加速了后续的 Find 操作。"},{question:"在 Kruskal 最小生成树算法中，并查集的作用是什么？",options:["存储图的所有边并按权重排序","判断加入一条边是否会形成环（即两个顶点是否已在同一连通分量中）","计算每条边的权重","存储最终的最小生成树结构"],answer:1,explanation:"Kruskal 算法按边的权重从小到大依次考虑每条边。对于每条边 (u, v)，算法需要判断 u 和 v 是否已经属于同一个连通分量：如果 Find(u) == Find(v)，则加入这条边会形成环，跳过；否则用 Union 将两个分量合并，并将这条边加入最小生成树。并查集让这个判断过程近乎 O(1)。"},{question:"同时使用路径压缩和按秩合并时，并查集的均摊时间复杂度是多少？",options:["O(n)","O(log n)","O(α(n))，其中 α 是反阿克曼函数，近似常数","O(n log n)"],answer:2,explanation:"同时使用路径压缩和按秩合并时，m 次操作（n 次 MakeSet + m 次 Find/Union）的总时间复杂度为 O(m · α(n))，其中 α(n) 是反阿克曼函数。阿克曼函数增长极快，其反函数 α(n) 增长极慢——对于宇宙中所有可观测的原子数量（约 10^80），α(n) 也不超过 4。因此在实际应用中，可以认为并查集的操作是常数时间的。"}],ag=`# 并查集 (Union-Find)

## 概念解释

并查集（Union-Find），也叫**不相交集合**（Disjoint Set），是一种用于管理元素分组的数据结构。它支持两种核心操作：

- **Find（查找）**：确定某个元素属于哪个集合。每个集合有一个**代表元素**（也叫根节点、集合标识），Find 返回的就是这个代表元素。
- **Union（合并）**：将两个集合合并为一个集合。

并查集的核心思想是：**每个集合用一棵树来表示**，树的根节点就是该集合的代表元素。所有属于同一集合的元素，最终都会沿着父节点指针找到同一个根。

\`\`\`
初始状态（6 个元素，各自独立）:
  {0}  {1}  {2}  {3}  {4}  {5}

执行 Union(0, 1), Union(2, 3), Union(4, 5) 后:
  {0, 1}  {2, 3}  {4, 5}

执行 Union(1, 3) 后:
  {0, 1, 2, 3}  {4, 5}

执行 Find(2) → 返回 0（代表元素）
执行 Find(4) → 返回 4（代表元素）
判断: Find(2) == Find(4)?  → 否，不在同一集合
\`\`\`

### 核心术语

- **代表元素 / 根节点（Representative / Root）**：每个集合的标识，是树的根节点。Find 操作返回的就是这个值。
- **父节点数组（Parent Array）**：\`parent[i]\` 存储元素 i 的父节点。根节点的父节点是自身（或设为 -1）。
- **按秩合并（Union by Rank）**：合并时将较矮的树挂到较高的树下面，保持平衡。
- **路径压缩（Path Compression）**：Find 过程中将路径上的节点直接指向根，加速后续查询。

## 为什么重要

并查集看似简单，却是解决**连通性问题**的利器：

**网络连通性判断**：判断两台计算机是否在同一网络中，或者网络中有多少个独立的子网络。

**Kruskal 最小生成树**：贪心地按权重从小到大选边，用并查集判断是否会形成环——这是并查集最经典的应用。

**社交网络好友圈**：判断两个人是否属于同一个社交圈子，或者统计一共有多少个独立的社交圈。

**渗流问题（Percolation）**：物理和材料科学中的经典问题，判断一个网格系统是否从顶部到底部连通。

**图像处理**：连通区域标记（Connected Component Labeling），将相邻的同色像素归为同一区域。

并查集的魅力在于：经过两种简单优化后，每次操作的均摊时间复杂度接近 **O(1)**，效率极高。

## 核心原理

### 基本实现：父节点数组

并查集的核心数据结构是一个数组 \`parent[]\`，其中 \`parent[i]\` 表示元素 i 的父节点。

\`\`\`typescript
// 初始化：每个元素是自己的父节点（独立集合）
function makeSet(n: number): number[] {
  const parent: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    parent[i] = i  // 自己是自己的代表
  }
  return parent
}
\`\`\`

\`\`\`
初始状态（n=6）:
索引:   0   1   2   3   4   5
parent: 0   1   2   3   4   5
        ↑   ↑   ↑   ↑   ↑   ↑
       根  根  根  根  根  根
\`\`\`

### 朴素 Find 操作

Find 操作沿着父节点指针向上追溯，直到找到根节点（\`parent[x] == x\`）。

\`\`\`typescript
function find(parent: number[], x: number): number {
  while (parent[x] !== x) {
    x = parent[x]
  }
  return x
}
\`\`\`

### 朴素 Union 操作

Union 操作先找到两个元素各自的根，然后将一棵树的根指向另一棵树的根。

\`\`\`typescript
function union(parent: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX !== rootY) {
    parent[rootX] = rootY  // 将 x 的根挂到 y 的根下面
  }
}
\`\`\`

\`\`\`
Union(0, 1):        Union(2, 3):        Union(1, 3):
  0 ← 1              2 ← 3              0 ← 1
                                          ↑
  parent[0]=1         parent[2]=3         2 ← 3
                                          ↑
                      rootX=find(1)=0     rootX=0, rootY=2
                                          parent[0]=2
                                          结果: 2 → 0 → 1
                                                ↑
                                                3
\`\`\`

朴素实现的问题：连续执行 \`union(0,1), union(1,2), union(2,3), ...\` 会形成一条长链，树高为 O(n)，Find 操作退化为 O(n)。

### 优化一：按秩合并（Union by Rank）

维护一个 \`rank[]\` 数组，记录每棵树的**上界高度**。合并时，总是将 rank 较小的树挂到 rank 较大的树下面。

\`\`\`typescript
function unionByRank(parent: number[], rank: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX === rootY) return

  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY    // 矮树挂到高树下
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX    // 矮树挂到高树下
  } else {
    parent[rootY] = rootX    // 高度相同，任选一个
    rank[rootX]++            // 高度加 1
  }
}
\`\`\`

\`\`\`
按秩合并示例:
  rank=1:   A       rank=1:   B
           / \\              / \\
          0   1            2   3

  Union(A, B): rank 相同，选 A 为新根
        A (rank=2)
       /|\\
      0 1 B
         / \\
        2   3

  树高保持最小，不会退化成链
\`\`\`

按秩合并保证树高最多为 O(log n)。

### 优化二：路径压缩（Path Compression）

在 Find 过程中，将路径上所有节点**直接指向根节点**，大幅缩短后续查询路径。

\`\`\`typescript
function findWithPathCompression(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findWithPathCompression(parent, parent[x])  // 递归压缩
  }
  return parent[x]
}
\`\`\`

\`\`\`
路径压缩前:          路径压缩后:
    3                     3
    ↑                   / | \\
    2        →         0  1  2
    ↑
    1
    ↑
    0

find(0) 后，0、1、2 都直接指向根 3
下次 find(0) 只需一步！
\`\`\`

### 两种优化结合：近似 O(1)

同时使用路径压缩和按秩合并，m 次操作的总时间复杂度为 **O(m · α(n))**，其中 α(n) 是**反阿克曼函数**。

阿克曼函数增长极快：A(4, 2) 已经是一个天文数字。其反函数 α(n) 增长极慢——即使 n 是宇宙中所有原子的数量（约 10^80），α(n) 也不超过 4。因此在实践中，并查集的每次操作可以认为是 **O(1)**。

| 优化方案 | Find 复杂度 | Union 复杂度 | m 次操作总复杂度 |
|---------|-----------|------------|----------------|
| 无优化 | O(n) | O(n) | O(mn) |
| 仅按秩合并 | O(log n) | O(log n) | O(m log n) |
| 仅路径压缩 | 均摊 O(log n) | 均摊 O(log n) | O(m log n) |
| 两者结合 | 均摊 O(α(n)) | 均摊 O(α(n)) | O(m α(n)) ≈ O(m) |

## 可视化说明

在可视化界面中，你可以直观地观察并查集的工作过程：

1. **森林结构**：每个元素显示为节点，父节点关系用箭头连接。每个集合形成一棵树，根节点用不同颜色高亮。
2. **Union 动画**：选择两个元素后，可以看到两棵树如何合并——较小的树被挂到较大树的根下面。
3. **Find 动画**：选择一个元素后，可以看到沿着父节点指针追溯到根的过程。开启路径压缩后，路径上的节点会重新连接到根。
4. **优化开关**：可以独立开启/关闭路径压缩和按秩合并，对比不同优化策略下的树结构变化。
5. **速度控制**：通过滑块调整动画速度，可以慢速观察每一步细节，也可以快速浏览整体过程。

## 常见错误

### 1. 忘记路径压缩导致性能退化

\`\`\`typescript
// 错误：朴素 Find，不压缩路径
function findBad(parent: number[], x: number): number {
  while (parent[x] !== x) {
    x = parent[x]
  }
  return x  // 路径上的节点下次还要重新遍历！
}

// 正确：使用路径压缩
function findGood(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findGood(parent, parent[x])
  }
  return parent[x]
}
\`\`\`

不使用路径压缩时，连续的 Union 操作可能形成高树，Find 退化为 O(n)。在数据量大的场景下，这会带来数量级的性能差异。

### 2. 朴素 Union 不考虑树高

\`\`\`typescript
// 错误：总是把 rootX 挂到 rootY 下
function unionBad(parent: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX !== rootY) {
    parent[rootX] = rootY  // 可能导致树越来越高
  }
}

// 正确：使用按秩合并
function unionGood(parent: number[], rank: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX === rootY) return

  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX
  } else {
    parent[rootY] = rootX
    rank[rootX]++
  }
}
\`\`\`

### 3. Find 实现中遗漏递归赋值

\`\`\`typescript
// 错误：只递归查找，没有更新 parent[x]
function findWrong(parent: number[], x: number): number {
  if (parent[x] !== x) {
    return findWrong(parent, parent[x])  // parent[x] 没有被更新！
  }
  return x
}

// 正确：递归返回时更新 parent[x]
function findCorrect(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findCorrect(parent, parent[x])  // 关键：parent[x] = ...
  }
  return parent[x]
}
\`\`\`

这叫"路径分裂"的遗漏版本——虽然能找到根，但没有压缩路径，丢失了优化效果。

### 4. 混淆 rank 和实际深度

\`\`\`typescript
// rank 不是精确的树高，而是上界
// 只在两棵树 rank 相同时才增加 rank
// 不要尝试用 rank 做精确的深度计算
\`\`\`

## 实际应用

### 1. Kruskal 最小生成树

\`\`\`typescript
interface Edge { u: number; v: number; weight: number }

function kruskal(n: number, edges: Edge[]): Edge[] {
  // 按权重排序
  edges.sort((a, b) => a.weight - b.weight)

  // 初始化并查集
  const parent: number[] = new Array(n)
  const rank: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i

  const mst: Edge[] = []

  for (const edge of edges) {
    const rootU = find(parent, edge.u)
    const rootV = find(parent, edge.v)

    if (rootU !== rootV) {
      // 不会形成环，加入 MST
      mst.push(edge)
      unionByRank(parent, rank, edge.u, edge.v)
    }

    if (mst.length === n - 1) break  // MST 已完成
  }

  return mst
}
\`\`\`

### 2. 网络连通性检测

\`\`\`typescript
class Network {
  private parent: number[]
  private rank: number[]
  private components: number

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    this.components = n
    for (let i = 0; i < n; i++) this.parent[i] = i
  }

  // 连接两台计算机
  connect(a: number, b: number): void {
    const rootA = find(this.parent, a)
    const rootB = find(this.parent, b)
    if (rootA !== rootB) {
      unionByRank(this.parent, this.rank, a, b)
      this.components--  // 连通分量减少
    }
  }

  // 判断两台计算机是否连通
  isConnected(a: number, b: number): boolean {
    return find(this.parent, a) === find(this.parent, b)
  }

  // 获取独立网络数量
  getComponentCount(): number {
    return this.components
  }
}
\`\`\`

### 3. 社交网络好友圈

\`\`\`typescript
// 统计社交网络中有多少个独立的好友圈
function countFriendCircles(n: number, friendships: [number, number][]): number {
  const parent: number[] = new Array(n)
  const rank: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i

  for (const [a, b] of friendships) {
    unionByRank(parent, rank, a, b)
  }

  // 统计有多少个不同的根
  const roots = new Set<number>()
  for (let i = 0; i < n; i++) {
    roots.add(find(parent, i))
  }
  return roots.size
}

// 示例: 6 个人，3 组好友关系
// friendships: [[0,1], [2,3], [4,5]]
// 结果: 3 个好友圈
\`\`\`

### 4. 图像连通区域标记

\`\`\`typescript
// 在二值图像中，将相邻的白色像素归为同一区域
function labelConnectedComponents(grid: number[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const n = rows * cols
  const parent: number[] = new Array(n)
  const rank: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        const idx = r * cols + c
        // 检查右邻居和下邻居
        if (c + 1 < cols && grid[r][c + 1] === 1) {
          unionByRank(parent, rank, idx, idx + 1)
        }
        if (r + 1 < rows && grid[r + 1][c] === 1) {
          unionByRank(parent, rank, idx, idx + cols)
        }
      }
    }
  }

  // 统计连通区域数
  const regions = new Set<number>()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        regions.add(find(parent, r * cols + c))
      }
    }
  }
  return regions.size
}
\`\`\`

## 总结

并查集是处理**不相交集合合并与查询**的高效数据结构，核心要点：

1. **两种操作**：Find 查找元素所属集合的代表，Union 合并两个集合。
2. **树形结构**：每个集合用一棵树表示，根节点是集合的代表元素，用父节点数组存储。
3. **两大优化**：路径压缩让 Find 近乎 O(1)，按秩合并保持树的平衡。两者结合后均摊时间复杂度为 O(α(n)) ≈ O(1)。
4. **经典应用**：Kruskal 最小生成树、网络连通性、社交圈分析、图像连通区域标记。
5. **实现简单**：只需一个 parent 数组和一个 rank 数组，代码量少但威力巨大。

并查集是"简单但强大"的典范——十几行代码就能解决复杂的连通性问题，是每个程序员工具箱中必备的数据结构。
`,us={...os,difficulty:os.difficulty},cg=sg;function fg(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(l=>l.trim());return i.every(l=>/^[-:]+$/.test(l))?"<!-- table separator -->":`<tr>${i.map(l=>`<td>${l}</td>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(us.id,{metadata:us,articleHtml:fg(ag),quiz:cg,getVisualization:()=>x(()=>import("./visualization-3Oi8V7VA.js"),[]),getDemo:()=>x(()=>import("./demo-CHRt_afW.js"),[])});const dg="dynamic-programming",pg="动态规划",mg="通过将问题分解为重叠子问题来高效求解的算法思想",hg="搜索算法",gg="advanced",yg=["DP","重叠子问题","最优子结构","记忆化"],vg=15,ss={id:dg,title:pg,description:mg,category:hg,difficulty:gg,tags:yg,order:vg},wg=[{question:"以下哪种情况适合使用动态规划？",options:["问题没有重叠子问题，但有最优子结构","问题有重叠子问题和最优子结构","问题有重叠子问题但没有最优子结构","问题既没有重叠子问题也没有最优子结构"],answer:1,explanation:"动态规划适用的两个核心条件是：(1) 重叠子问题——同一个子问题会被多次计算；(2) 最优子结构——问题的最优解包含子问题的最优解。如果只有最优子结构但没有重叠子问题（如归并排序），使用分治法更合适。如果没有最优子结构（如最长简单路径问题），则不能使用动态规划。"},{question:"记忆化搜索（Memoization）和自底向上制表法（Tabulation）的主要区别是什么？",options:["记忆化搜索更快，制表法更慢","记忆化是自顶向下的递归 + 缓存，制表法是自底向上的迭代填充","记忆化只能解决一维问题，制表法可以解决多维问题","记忆化使用哈希表，制表法使用数组，两者不可互换"],answer:1,explanation:"记忆化搜索是自顶向下的方法：从原问题出发递归分解子问题，遇到已计算的结果直接返回（用缓存避免重复计算）。制表法是自底向上的方法：从最小子问题开始，按顺序填表，逐步推导出原问题的解。两者时间复杂度相同，但制表法通常空间开销更小且没有递归栈开销。"},{question:"0/1 背包问题的状态转移方程是什么？（dp[i][w] 表示前 i 个物品、背包容量为 w 时的最大价值）",options:["dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi] + vi)","dp[i][w] = dp[i-1][w] + dp[i][w-wi]","dp[i][w] = max(dp[i][w-1], dp[i-1][w])","dp[i][w] = dp[i-1][w-1] + 1"],answer:0,explanation:"对于第 i 个物品（重量 wi，价值 vi），有两种选择：(1) 不选它——最大价值等于前 i-1 个物品在容量 w 下的最大价值 dp[i-1][w]；(2) 选它（前提是 w >= wi）——最大价值等于前 i-1 个物品在容量 w-wi 下的最大价值加上 vi，即 dp[i-1][w-wi] + vi。取两者的较大值。"},{question:"最长公共子序列 (LCS) 问题的时间复杂度和空间复杂度分别是什么？（两个序列长度分别为 m 和 n）",options:["时间 O(m+n)，空间 O(m+n)","时间 O(mn)，空间 O(mn)","时间 O(mn log n)，空间 O(mn)","时间 O(2^(m+n))，空间 O(1)"],answer:1,explanation:"LCS 的 DP 解法需要填充一个 (m+1) x (n+1) 的二维表格，每个单元格的计算时间是 O(1)，因此总时间复杂度为 O(mn)。空间复杂度也是 O(mn) 用于存储 DP 表。不过可以通过滚动数组优化将空间复杂度降至 O(min(m,n))。"},{question:"如何判断一个问题是否具有最优子结构？",options:["问题可以用递归求解","问题的最优解可以通过组合其子问题的最优解来得到","问题的时间复杂度低于指数级","问题的解空间是有限的"],answer:1,explanation:"最优子结构的定义是：问题的最优解包含其子问题的最优解。换句话说，我们可以通过组合子问题的最优解来构造原问题的最优解。例如，最短路径问题具有最优子结构（最短路径的子路径也是最短路径），但最长简单路径问题不具有最优子结构。注意：能用递归求解并不意味着一定有最优子结构。"}],kg=`# 动态规划 (Dynamic Programming)

## 概念解释

动态规划（Dynamic Programming，简称 DP）是一种通过将复杂问题分解为更小的**重叠子问题**来高效求解的算法思想。它不是一种具体的算法，而是一种解决问题的**方法论**。

### 核心术语

- **重叠子问题（Overlapping Subproblems）**：在求解过程中，同一个子问题会被反复多次计算。例如计算斐波那契数列 F(5) 时，F(3) 会被计算两次，F(2) 会被计算三次。如果能记住已经计算过的结果，就可以避免大量重复计算。

- **最优子结构（Optimal Substructure）**：问题的最优解可以通过组合其子问题的最优解来获得。例如，从 A 到 B 的最短路径上，任意两点之间的子路径也是最短路径。这是动态规划能正确工作的前提。

- **状态（State）**：描述子问题的参数集合。好的状态定义是 DP 成功的关键。例如在背包问题中，状态是「前 i 个物品、剩余容量为 w」。

- **状态转移方程（State Transition Equation）**：描述状态之间递推关系的数学公式。它是 DP 的核心，决定了如何从已知状态推导出未知状态。

- **记忆化（Memoization）**：自顶向下的方法，通过递归 + 缓存来避免重复计算。

- **制表法（Tabulation）**：自底向上的方法，通过迭代填充表格来逐步求解。

### 记忆化 vs 制表法

| 特性 | 记忆化（Memoization） | 制表法（Tabulation） |
|------|----------------------|---------------------|
| 方向 | 自顶向下 | 自底向上 |
| 实现方式 | 递归 + 哈希表/数组缓存 | 迭代 + 数组填充 |
| 计算顺序 | 按需计算，只算需要的子问题 | 按固定顺序，可能计算不需要的子问题 |
| 空间开销 | 通常较大（递归栈 + 缓存） | 通常较小（只需数组） |
| 代码风格 | 更直观，接近问题的自然递归定义 | 需要确定正确的填充顺序 |
| 适用场景 | 子问题空间稀疏时更高效 | 子问题空间稠密时更高效 |

## 为什么重要

### 1. 将指数级降为多项式级

动态规划最强大的地方在于：它能将指数级时间复杂度的暴力解法优化到多项式级。

以斐波那契数列为例：
- 暴力递归：O(2^n)——每个问题分裂为两个子问题
- 动态规划：O(n)——每个子问题只计算一次

对于 LCS 问题：
- 暴力枚举：O(2^n × 2^m)——枚举所有子序列
- 动态规划：O(n × m)——填充一个二维表格

### 2. 优化问题的通用解法

很多实际问题天然具有最优子结构和重叠子问题的特征：
- 资源分配：有限预算下如何最大化收益
- 路径规划：最短路径、最少换乘
- 序列比对：DNA 序列比对、文本 diff
- 调度问题：任务调度、课程安排

### 3. 面试高频考点

动态规划是技术面试中最常见的高级算法话题。LeetCode 上超过 20% 的题目涉及动态规划。掌握 DP 不仅能解决具体问题，更能训练将复杂问题分解为子问题的思维方式。

### 4. 真实世界的优化

许多工业级系统的核心算法都基于动态规划：
- 生物信息学中的序列比对（BLAST、ClustalW）
- 编译器的寄存器分配和指令调度
- 通信系统的 Viterbi 解码算法
- 经济学中的最优决策模型

## 核心原理

### 自顶向下：记忆化搜索

记忆化搜索的思路非常直观：从原问题出发递归分解，用缓存记录已计算的结果。

\`\`\`typescript
// 斐波那契数列 - 记忆化搜索
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  // 基础情况
  if (n <= 1) return n

  // 检查缓存
  if (cache.has(n)) return cache.get(n)!

  // 递归计算并缓存
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
  cache.set(n, result)
  return result
}
\`\`\`

### 自底向上：制表法

制表法从最小子问题开始，按顺序填表，逐步推导出原问题的解。

\`\`\`typescript
// 斐波那契数列 - 制表法
function fibTable(n: number): number {
  if (n <= 1) return n

  const dp = new Array(n + 1)
  dp[0] = 0
  dp[1] = 1

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]  // 状态转移方程
  }
  return dp[n]
}
\`\`\`

### 状态转移方程的设计

状态转移方程是 DP 的灵魂。设计一个好的状态转移方程需要：

1. **定义状态**：明确 dp[i]（或 dp[i][j]）代表什么含义
2. **找到递推关系**：当前状态如何由之前的状态推导
3. **确定基础情况**：最小子问题的答案是什么
4. **确定填充顺序**：确保计算某个状态时，它依赖的状态已经计算完毕

### DP 表的填充顺序

对于二维 DP（如背包、LCS），填充顺序至关重要：

\`\`\`
对于 dp[i][j]，通常的填充顺序：
  外层循环：i 从小到大
  内层循环：j 从小到大

这样可以保证：
  dp[i-1][j]   （上方）已经计算
  dp[i][j-1]   （左方）已经计算
  dp[i-1][j-1] （左上方）已经计算
\`\`\`

## 经典问题详解

### 0/1 背包问题

**问题描述**：有 n 个物品，每个物品有重量 wi 和价值 vi。背包容量为 W，每个物品只能选或不选（0/1），求背包能装下的最大总价值。

**状态定义**：\`dp[i][w]\` = 前 i 个物品中选择，背包容量为 w 时的最大价值

**状态转移方程**：
\`\`\`
dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi] + vi)  （当 w >= wi）
dp[i][w] = dp[i-1][w]                              （当 w < wi）
\`\`\`

**基础情况**：\`dp[0][w] = 0\`（没有物品时价值为 0）

\`\`\`typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  )

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (w >= weights[i - 1]) {
        dp[i][w] = Math.max(
          dp[i - 1][w],                    // 不选第 i 个物品
          dp[i - 1][w - weights[i - 1]] + values[i - 1]  // 选第 i 个物品
        )
      } else {
        dp[i][w] = dp[i - 1][w]           // 装不下，不选
      }
    }
  }
  return dp[n][capacity]
}
\`\`\`

**示例**：物品重量 [2, 3, 4, 5]，价值 [3, 4, 5, 6]，背包容量 8

DP 表填充过程：
\`\`\`
       w=0  w=1  w=2  w=3  w=4  w=5  w=6  w=7  w=8
i=0  [  0    0    0    0    0    0    0    0    0  ]
i=1  [  0    0    3    3    3    3    3    3    3  ]
i=2  [  0    0    3    4    4    7    7    7    7  ]
i=3  [  0    0    3    4    5    7    8    9    12 ]
i=4  [  0    0    3    4    5    7    8    9    12 ]
\`\`\`

### 最长公共子序列 (LCS)

**问题描述**：给定两个序列 X 和 Y，找出它们的最长公共子序列的长度。

**状态定义**：\`dp[i][j]\` = X 的前 i 个字符和 Y 的前 j 个字符的 LCS 长度

**状态转移方程**：
\`\`\`
dp[i][j] = dp[i-1][j-1] + 1       （当 X[i] == Y[j]）
dp[i][j] = max(dp[i-1][j], dp[i][j-1])  （当 X[i] != Y[j]）
\`\`\`

**基础情况**：\`dp[0][j] = 0\`，\`dp[i][0] = 0\`

\`\`\`typescript
function lcs(X: string, Y: string): number {
  const m = X.length
  const n = Y.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1  // 字符匹配
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])  // 字符不匹配
      }
    }
  }
  return dp[m][n]
}
\`\`\`

**示例**：X = "ABCBDAB"，Y = "BDCAB"

\`\`\`
       ""   B    D    C    A    B
  ""  [ 0    0    0    0    0    0 ]
  A   [ 0    0    0    0    1    1 ]
  B   [ 0    1    1    1    1    2 ]
  C   [ 0    1    1    2    2    2 ]
  B   [ 0    1    1    2    2    3 ]
  D   [ 0    1    2    2    2    3 ]
  A   [ 0    1    2    2    3    3 ]
  B   [ 0    1    2    2    3    4 ]
\`\`\`

LCS 长度为 4（子序列为 "BCAB"）。

### 编辑距离 (Edit Distance)

**问题描述**：将字符串 A 转换为字符串 B，可以执行插入、删除、替换操作，求最少操作次数。

**状态定义**：\`dp[i][j]\` = A 的前 i 个字符转换为 B 的前 j 个字符所需的最少操作数

**状态转移方程**：
\`\`\`
dp[i][j] = dp[i-1][j-1]           （当 A[i] == B[j]，无需操作）
dp[i][j] = 1 + min(
  dp[i-1][j],     // 删除 A[i]
  dp[i][j-1],     // 插入 B[j]
  dp[i-1][j-1]    // 替换 A[i] 为 B[j]
)
\`\`\`

\`\`\`typescript
function editDistance(A: string, B: string): number {
  const m = A.length
  const n = B.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  // 基础情况
  for (let i = 0; i <= m; i++) dp[i][0] = i  // 删除所有字符
  for (let j = 0; j <= n; j++) dp[0][j] = j  // 插入所有字符

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]  // 字符相同，无需操作
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // 删除
          dp[i][j - 1],     // 插入
          dp[i - 1][j - 1]  // 替换
        )
      }
    }
  }
  return dp[m][n]
}
\`\`\`

## 可视化说明

在右侧的可视化面板中，你可以直观地观察动态规划的执行过程：

- **DP 表格**：以二维网格形式展示 DP 表的填充过程
- **逐步动画**：逐单元格、逐行地展示表格填充过程
- **依赖关系**：高亮当前正在计算的单元格以及它所依赖的单元格（上方、左方、左上方），用箭头指示依赖方向
- **值计算过程**：展示每个单元格的值是如何通过状态转移方程计算得出的
- **问题切换**：通过下拉菜单选择不同问题（背包/LCS/编辑距离）
- **播放控制**：播放/暂停、速度调节、重置功能

通过控制栏，你可以：
- 选择不同的 DP 问题进行观察
- 调整动画速度，仔细研究每一步的计算过程
- 查看当前的状态转移方程和操作说明

## 常见错误

### 1. 未识别重叠子问题，选错方法

\`\`\`typescript
// 错误：用纯递归解决斐波那契，没有缓存
// 时间复杂度 O(2^n)，大量重复计算
function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(3) 被计算了多次！
}

// 正确：使用记忆化或制表法
function fibDP(n: number): number {
  const dp = [0, 1]
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[n]
}
\`\`\`

### 2. 状态定义不正确

\`\`\`typescript
// 错误：在背包问题中只用一维状态
// dp[w] = 容量为 w 时的最大价值
// 这样无法区分「前 i 个物品」和「所有物品」
// 可能导致同一个物品被多次选择

// 正确：使用二维状态 dp[i][w]
// 明确表示「前 i 个物品、容量为 w」
\`\`\`

### 3. 基础情况设置错误

\`\`\`typescript
// 错误：编辑距离的基础情况
const dp: number[][] = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(0)  // 全部初始化为 0！
)
// dp[i][0] 应该是 i（删除 i 个字符），不是 0
// dp[0][j] 应该是 j（插入 j 个字符），不是 0

// 正确：
for (let i = 0; i <= m; i++) dp[i][0] = i
for (let j = 0; j <= n; j++) dp[0][j] = j
\`\`\`

### 4. 填充顺序错误

\`\`\`typescript
// 错误：在 LCS 中，从右下角开始填充
for (let i = m; i >= 1; i--) {
  for (let j = n; j >= 1; j--) {
    // dp[i-1][j-1] 还没有计算！
  }
}

// 正确：从左上角开始，逐行逐列填充
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    // dp[i-1][j], dp[i][j-1], dp[i-1][j-1] 都已计算
  }
}
\`\`\`

### 5. 忽略空间优化

\`\`\`typescript
// 不够优化：O(mn) 空间
const dp: number[][] = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(0)
)

// 空间优化：O(n) 空间（利用滚动数组）
// 因为 dp[i][j] 只依赖 dp[i-1][...] 和 dp[i][j-1]
const prev = new Array(n + 1).fill(0)
const curr = new Array(n + 1).fill(0)
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    // 用 prev 和 curr 交替计算
  }
  [prev, curr] = [curr, prev]  // 交换引用
}
\`\`\`

## 实际应用

### 生物信息学：序列比对

DNA 和蛋白质序列比对是动态规划最经典的应用之一。两个基因序列的比对本质上就是 LCS 或编辑距离问题的变种。

\`\`\`typescript
// DNA 序列比对示例
const seq1 = "AGTACGCA"
const seq2 = "TATGC"
const score = lcs(seq1, seq2)  // 找到最长公共子序列
// LCS = "TACGC"，长度 5
\`\`\`

全局比对（Needleman-Wunsch 算法）和局部比对（Smith-Waterman 算法）都基于 DP，广泛用于基因组学研究。

### 资源分配

在有限资源下最大化收益的问题本质上是背包问题的变种：

\`\`\`typescript
// 项目投资决策
// 有 100 万预算，每个项目需要不同投资额，预期收益不同
// 每个项目只能投或不投（0/1 背包）
const budgets = [20, 30, 40, 50]   // 各项目投资额（万元）
const profits = [15, 25, 35, 45]   // 各项目预期收益（万元）
const maxBudget = 100               // 总预算

const maxProfit = knapsack(budgets, profits, maxBudget)
// 结果：选择项目 2 和 4，总投资 80 万，最大收益 70 万
\`\`\`

### 文本 diff 算法

Git、VS Code 等工具的文本差异比较算法基于编辑距离的 DP 解法：

\`\`\`typescript
// 两段文本的差异比较
const oldText = "Hello World"
const newText = "Hello DP World"
const distance = editDistance(oldText, newText)
// 编辑距离 = 1（插入 "DP "）
\`\`\`

实际的 diff 工具（如 Myers diff 算法）是对编辑距离 DP 的进一步优化，能输出具体的操作序列。

### 最短路径变种

许多路径规划问题是 DP 的应用：

\`\`\`typescript// 最小路径和：从左上角到右下角，只能向右或向下移动
function minPathSum(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))

  dp[0][0] = grid[0][0]
  for (let i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0]
  for (let j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j]

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
    }
  }
  return dp[m - 1][n - 1]
}
\`\`\`

### 其他经典 DP 问题

- **最长递增子序列 (LIS)**：O(n log n) 解法，用于数据分析和推荐系统
- **零钱兑换**：完全背包的变种，用于金融计算
- **矩阵链乘法**：优化矩阵乘法顺序，减少计算量
- **最优二叉搜索树**：数据库索引优化
- **区间 DP**：括号匹配、石子合并等

## 总结

动态规划是算法设计中最重要的思想之一。掌握 DP 需要理解以下核心要点：

- **两大条件**：重叠子问题 + 最优子结构，缺一不可
- **两种实现**：记忆化搜索（自顶向下）和制表法（自底向上），根据问题特点选择
- **四步设计法**：定义状态 → 写出转移方程 → 确定基础情况 → 确定填充顺序
- **空间优化**：利用滚动数组或状态压缩，将二维 DP 优化为一维
- **常见陷阱**：状态定义不准确、基础情况错误、填充顺序不对、忽略边界条件

动态规划不是靠背模板就能掌握的，需要通过大量练习来培养「状态定义」的直觉。建议从经典的斐波那契、背包、LCS 问题开始，逐步挑战更复杂的区间 DP、树形 DP、数位 DP 等进阶话题。
`,as={...ss,difficulty:ss.difficulty},Sg=wg;function _g(e){return e.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/```(\w*)\n([\s\S]*?)```/g,(t,r,i)=>`<pre><code>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`).replace(/^\|(.+)\|$/gm,(t,r)=>{const i=r.split("|").map(l=>l.trim());return i.every(l=>/^[-:]+$/.test(l))?"<!-- table separator -->":`<tr>${i.map(l=>`<td>${l}</td>`).join("")}</tr>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/^\d+\. (.+)$/gm,"<li>$1</li>").split(`

`).map(t=>{const r=t.trim();return r?r.startsWith("<h")||r.startsWith("<pre")||r.startsWith("<ul")||r.startsWith("<ol")||r.startsWith("<tr")||r.startsWith("<!--")?r:r.includes("<tr>")?`<table>${r.replace(/<!-- table separator -->/g,"")}</table>`:`<p>${r.replace(/\n/g,"<br>")}</p>`:""}).join(`
`).replace(/<p><\/p>/g,"").replace(/<!-- table separator -->/g,"")}te.register(as.id,{metadata:as,articleHtml:_g(kg),quiz:Sg,getVisualization:()=>x(()=>import("./visualization-DJSDNJBG.js"),[]),getDemo:()=>x(()=>import("./demo-Cez5WkxR.js"),[])});Qi.createRoot(document.getElementById("root")).render(j.jsx(Hc.StrictMode,{children:j.jsx(jp,{})}));export{j,Le as r};
