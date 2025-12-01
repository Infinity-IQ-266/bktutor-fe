import svgPaths from "./svg-zvzkd9pgee";
import imgImage from "figma:asset/6f8d31165ed17686442a3e4ad430e28054b62993.png";
import imgContainer from "figma:asset/60c3d24e4f2268475cbc3c46d5f54f55ba2235dd.png";

function Icon() {
  return (
    <div className="h-[29.75px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[1.6%] left-0 right-[0.28%] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 206 30">
          <path d={svgPaths.p1d13b880} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[54px] items-start left-[36px] top-0 w-[206px]" data-name="Container">
      <Icon />
    </div>
  );
}

function LogoGroup21() {
  return (
    <div className="absolute h-[66px] left-[221px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[270px] w-[223px]" data-name="LogoGroup21">
      <Container />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute h-[114px] left-[129px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[222px] w-[106px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[36px] left-[85px] top-[348px] w-[448px]" data-name="Heading 1">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[36px] left-[224.66px] text-[30px] text-center text-nowrap text-white top-[-2.6px] translate-x-[-50%] whitespace-pre">Tutor Support System</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[28px] left-[87px] top-[414px] w-[448px]" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[28px] left-[223.69px] text-[18px] text-[rgba(255,255,255,0.8)] text-center text-nowrap top-[-1.4px] translate-x-[-50%] whitespace-pre">Ho Chi Minh City University of Technology - VNU</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[48px] left-[86.4px] top-[441.6px] w-[448px]" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[24px] left-[223.1px] text-[16px] text-[rgba(255,255,255,0.6)] text-center top-[6.4px] translate-x-[-50%] w-[447px]">Connecting students with expert tutors for academic excellence and personal growth.</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[723.2px] left-0 top-0 w-[620.8px]" data-name="Container">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-[#0f2d52] inset-0" />
        <img alt="" className="absolute max-w-none mix-blend-soft-light object-50%-50% object-cover size-full" src={imgContainer} />
      </div>
      <div className="absolute h-[724px] left-[-545px] top-[4px] w-[1782px]" data-name="slbk 1" />
      <LogoGroup21 />
      <Image />
      <Heading1 />
      <Paragraph />
      <Paragraph1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex h-[31.988px] items-start relative shrink-0 w-full" data-name="Heading 2">
      <p className="basis-0 font-['Arimo:Regular',sans-serif] font-normal grow leading-[32px] min-h-px min-w-px relative shrink-0 text-[#2d3748] text-[24px]">Sign in with HCMUT SSO</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[24px] left-0 text-[16px] text-gray-500 text-nowrap top-[-2.2px] whitespace-pre">Enter your university credentials to continue</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[63.987px] items-start left-[32.8px] top-[32.8px] w-[382.4px]" data-name="Container">
      <Heading2 />
      <Paragraph2 />
    </div>
  );
}

function PrimitiveLabel() {
  return (
    <div className="content-stretch flex gap-[8px] h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#2d3748] text-[14px] text-nowrap whitespace-pre">Email Address</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex h-[36px] items-center px-[12px] py-[4px] relative w-full">
          <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-gray-500 text-nowrap whitespace-pre">yourname@hcmut.edu.vn</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[54px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel />
      <Input />
    </div>
  );
}

function PrimitiveLabel1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#2d3748] text-[14px] text-nowrap whitespace-pre">Password</p>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex h-[36px] items-center px-[12px] py-[4px] relative w-full">
          <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-gray-500 text-nowrap whitespace-pre">Enter your password</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[54px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel1 />
      <Input1 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#0f2d52] h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Button">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[20px] left-[169.2px] text-[14px] text-nowrap text-white top-[6.8px] whitespace-pre">Sign In</p>
    </div>
  );
}

function Form() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[176px] items-start left-[32.8px] top-[120.79px] w-[382.4px]" data-name="Form">
      <Container3 />
      <Container4 />
      <Button />
    </div>
  );
}

function Link() {
  return (
    <div className="absolute content-stretch flex h-[18.4px] items-start left-[153.25px] top-[315.99px] w-[141.488px]" data-name="Link">
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#0f2d52] text-[14px] text-center text-nowrap whitespace-pre">Forgot your password?</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white h-[369.587px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container2 />
      <Form />
      <Link />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[20px] left-[200.11px] text-[14px] text-center text-gray-500 text-nowrap top-[-1.2px] translate-x-[-50%] whitespace-pre">Quick Login (Demo)</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#f8f9fa] box-border content-stretch flex gap-[6px] h-[32px] items-center justify-center left-0 px-[12.8px] py-[0.8px] rounded-[6px] top-0 w-[195.2px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#2d3748] text-[12px] text-nowrap whitespace-pre">Student</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[#f8f9fa] box-border content-stretch flex gap-[6px] h-[32px] items-center justify-center left-[203.2px] px-[12.8px] py-[0.8px] rounded-[6px] top-0 w-[195.2px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#2d3748] text-[12px] text-nowrap whitespace-pre">Tutor</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#f8f9fa] box-border content-stretch flex gap-[6px] h-[32px] items-center justify-center left-0 px-[12.8px] py-[0.8px] rounded-[6px] top-[40px] w-[195.2px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#2d3748] text-[12px] text-nowrap whitespace-pre">Coordinator</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[#f8f9fa] box-border content-stretch flex gap-[6px] h-[32px] items-center justify-center left-[203.2px] px-[12.8px] py-[0.8px] rounded-[6px] top-[40px] w-[195.2px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#2d3748] text-[12px] text-nowrap whitespace-pre">Dept. Chair</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute bg-[#f8f9fa] box-border content-stretch flex gap-[6px] h-[32px] items-center justify-center left-0 px-[12.8px] py-[0.8px] rounded-[6px] top-[80px] w-[398.4px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#2d3748] text-[12px] text-nowrap whitespace-pre">Administrator</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[112px] relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-gray-50 h-[193.6px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[12px] h-[193.6px] items-start pb-[0.8px] pt-[24.8px] px-[24.8px] relative w-full">
          <Paragraph3 />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[587.188px] items-start left-[707.2px] top-[68px] w-[448px]" data-name="Container">
      <Container5 />
      <Container7 />
    </div>
  );
}

export default function LogIn() {
  return (
    <div className="bg-[#f8f9fa] relative size-full" data-name="Log in">
      <Container1 />
      <Container8 />
    </div>
  );
}