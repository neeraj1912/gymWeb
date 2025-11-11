import WordPullUp from "@/components/ui/word-pull-up";
import Form from "./form";
import FloatingNavDemo from "../LandingPage/navbar";
import BottomNavbar from "../LandingPage/bottom-navbar";
import LandingPageHeader from "../LandingPage/header";

const AddPerson = () => {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pb-24">
       {/* <FloatingNavDemo />
        <WordPullUp
        className="text-4xl font-bold tracking-[-0.02em] text-blue-700 dark:text-white md:text-7xl md:leading-[5rem]"
        words="SR Fitness"
      /> */}
       <LandingPageHeader />
      <BottomNavbar />
      <Form/>
    </div>
  )
}

export default AddPerson