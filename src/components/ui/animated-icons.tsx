"use client"

import { motion, Variants } from "motion/react"
import { Trash, PencilSimple, Target, Play, Square } from '@phosphor-icons/react/dist/ssr';
import { cn } from "@/lib/utils"

const trashVariants: Variants = {
  hover: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 }
  }
}

const editVariants: Variants = {
  hover: {
    rotate: [0, 15, -15, 0],
    scale: 1.1,
    transition: { duration: 0.3 }
  }
}

const targetVariants: Variants = {
  hover: {
    scale: 1.2,
    rotate: 180,
    transition: { duration: 0.4 }
  }
}

const playVariants: Variants = {
  hover: {
    scale: 1.2,
    transition: { duration: 0.2 }
  }
}

export const AnimatedTrash = ({ className }: { className?: string }) => (
  <motion.div variants={trashVariants} whileHover="hover" className="inline-block">
    <Trash className={cn("h-4 w-4", className)} />
  </motion.div>
)

export const AnimatedEdit = ({ className }: { className?: string }) => (
  <motion.div variants={editVariants} whileHover="hover" className="inline-block">
    <PencilSimple className={cn("h-4 w-4", className)} />
  </motion.div>
)

export const AnimatedTarget = ({ className }: { className?: string }) => (
  <motion.div variants={targetVariants} whileHover="hover" className="inline-block">
    <Target className={cn("h-4 w-4", className)} />
  </motion.div>
)

export const AnimatedPlay = ({ className }: { className?: string }) => (
  <motion.div variants={playVariants} whileHover="hover" className="inline-block">
    <Play className={cn("h-4 w-4", className)} />
  </motion.div>
)

export const AnimatedSquare = ({ className }: { className?: string }) => (
  <motion.div variants={playVariants} whileHover="hover" className="inline-block">
    <Square className={cn("h-4 w-4", className)} />
  </motion.div>
)
