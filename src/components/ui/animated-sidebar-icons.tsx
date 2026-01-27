"use client"

import { motion, Variants } from "framer-motion"
import { Timer, CheckSquare, BarChart3, Trophy, Settings, BookOpen, MessageSquare, Gamepad2, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const iconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
        scale: 1.1,
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.3 }
    },
    active: {
        scale: 1.15,
        transition: { type: "spring", stiffness: 400, damping: 10 }
    }
}

interface AnimatedIconProps {
    className?: string
    isActive?: boolean
    Icon: LucideIcon
}

const AnimatedIcon = ({ Icon, className, isActive }: AnimatedIconProps) => {
    return (
        <motion.div
            variants={iconVariants}
            initial="initial"
            animate={isActive ? "active" : "initial"}
            whileHover={isActive ? "active" : "hover"}
            className="flex items-center justify-center"
        >
            <Icon className={cn("h-4 w-4", className)} />
        </motion.div>
    )
}

export const AnimatedTimer = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={Timer} {...props} />
)

export const AnimatedTasks = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={CheckSquare} {...props} />
)

export const AnimatedHistory = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={BarChart3} {...props} />
)

export const AnimatedLeaderboard = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={Trophy} {...props} />
)

export const AnimatedSettings = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={Settings} {...props} />
)

export const AnimatedGuide = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={BookOpen} {...props} />
)

export const AnimatedFeedback = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={MessageSquare} {...props} />
)

export const AnimatedEntertainment = (props: Omit<AnimatedIconProps, "Icon">) => (
    <AnimatedIcon Icon={Gamepad2} {...props} />
)
