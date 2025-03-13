import{N as y,j as o,k as a,A as t,t as r,x as n,l as p,O as g,d as h,B as v,D as d,C as m,K as w,bu as f,y as k,ae as C,L as B}from"./index-BXHSmgx-.js";var I=({dt:e})=>`
.p-card {
    background: ${e("card.background")};
    color: ${e("card.color")};
    box-shadow: ${e("card.shadow")};
    border-radius: ${e("card.border.radius")};
    display: flex;
    flex-direction: column;
}

.p-card-caption {
    display: flex;
    flex-direction: column;
    gap: ${e("card.caption.gap")};
}

.p-card-body {
    padding: ${e("card.body.padding")};
    display: flex;
    flex-direction: column;
    gap: ${e("card.body.gap")};
}

.p-card-title {
    font-size: ${e("card.title.font.size")};
    font-weight: ${e("card.title.font.weight")};
}

.p-card-subtitle {
    color: ${e("card.subtitle.color")};
}
`,N={root:"p-card p-component",header:"p-card-header",body:"p-card-body",caption:"p-card-caption",title:"p-card-title",subtitle:"p-card-subtitle",content:"p-card-content",footer:"p-card-footer"},D=y.extend({name:"card",style:I,classes:N}),L={name:"BaseCard",extends:g,style:D,provide:function(){return{$pcCard:this,$parentInstance:this}}},$={name:"Card",extends:L,inheritAttrs:!1};function S(e,c,l,s,i,u){return o(),a("div",t({class:e.cx("root")},e.ptmi("root")),[e.$slots.header?(o(),a("div",t({key:0,class:e.cx("header")},e.ptm("header")),[r(e.$slots,"header")],16)):n("",!0),p("div",t({class:e.cx("body")},e.ptm("body")),[e.$slots.title||e.$slots.subtitle?(o(),a("div",t({key:0,class:e.cx("caption")},e.ptm("caption")),[e.$slots.title?(o(),a("div",t({key:0,class:e.cx("title")},e.ptm("title")),[r(e.$slots,"title")],16)):n("",!0),e.$slots.subtitle?(o(),a("div",t({key:1,class:e.cx("subtitle")},e.ptm("subtitle")),[r(e.$slots,"subtitle")],16)):n("",!0)],16)):n("",!0),p("div",t({class:e.cx("content")},e.ptm("content")),[r(e.$slots,"content")],16),e.$slots.footer?(o(),a("div",t({key:1,class:e.cx("footer")},e.ptm("footer")),[r(e.$slots,"footer")],16)):n("",!0)],16)],16)}$.render=S;const V={class:"m-3 flex flex-row items-center justify-center"},x=h({__name:"Login",setup(e){function c(l){let s=new FormData(l.target);f.login.submit({email:s.get("email"),password:s.get("password")})}return(l,s)=>{const i=v("Input"),u=B,b=$;return o(),a("div",V,[d(b,{title:"Login to your FrappeUI App!",class:"w-full max-w-md mt-4"},{default:m(()=>[p("form",{class:"flex flex-col space-y-2 w-full",onSubmit:C(c,["prevent"])},[d(i,{required:"",name:"email",type:"text",placeholder:"johndoe@email.com",label:"User ID"}),d(i,{required:"",name:"password",type:"password",placeholder:"••••••",label:"Password"}),d(u,{loading:w(f).login.loading,variant:"solid"},{default:m(()=>s[0]||(s[0]=[k("Login")])),_:1},8,["loading"])],32)]),_:1})])}}});export{x as default};
