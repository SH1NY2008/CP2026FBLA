import Link from "next/link"
import { motion } from "framer-motion" 
 import { Button } from "@/components/ui/button" 
 import { ArrowRight, MessageCircle, Store } from "lucide-react" 
 
 export function Footer() { 
   return ( 
     <footer className="relative bg-background overflow-hidden">
      <section className="py-20 border-y border-neutral-900 overflow-hidden bg-black">
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-20 items-center px-10"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-20 text-8xl font-bold text-neutral-900 uppercase tracking-tighter select-none">
                <span>Support Local</span>
                <span className="text-neutral-800">Find Deals</span>
                <span>Community First</span>
                <span className="text-neutral-800">Grow Together</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center pt-20 pb-96"> 
         {/* Navigation Links */} 
         <div className="flex flex-wrap justify-center gap-x-20 gap-y-4 mb-16 text-sm font-bold uppercase tracking-wide"> 
           <Link href="/browse" className="hover:text-primary transition-colors"> 
             Browse 
           </Link> 
           <Link href="/deals" className="hover:text-primary transition-colors"> 
             Deals 
           </Link> 
           <Link href="/docs" className="hover:text-primary transition-colors"> 
             Resources 
           </Link> 
           <Link href="/help" className="hover:text-primary transition-colors"> 
             Contact 
           </Link> 
         </div> 
 
         {/* Legal & Copyright */} 
         <div className="flex flex-wrap justify-center gap-x-16 gap-y-4 text-xs text-muted-foreground"> 
           <span>© 2026 Byte-Sized Boost</span> 
           <Link href="/privacy" className="hover:text-primary transition-colors"> 
             Privacy Policy 
           </Link> 
           <Link href="/terms" className="hover:text-primary transition-colors"> 
             Terms of Service 
           </Link> 
         </div> 
       </div> 
 
       {/* Giant Text Footer */} 
       <div className="w-full overflow-hidden leading-none select-none pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center translate-y-[35%]"> 
         <h1 className="text-[35vw] font-black text-foreground tracking-tighter text-center leading-[0.8]"> 
           BYTE 
         </h1> 
       </div> 
     </footer> 
   ) 
 } 