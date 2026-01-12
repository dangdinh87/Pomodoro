"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    value?: string
    previousValue?: string
}>({})

const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ onValueChange, value, defaultValue, ...props }, ref) => {
    const [currentValue, setCurrentValue] = React.useState<string | undefined>(
        value || defaultValue
    )
    const [previousValue, setPreviousValue] = React.useState<string | undefined>(
        undefined
    )

    const handleValueChange = (val: string) => {
        setPreviousValue(currentValue)
        setCurrentValue(val)
        onValueChange?.(val)
    }

    // Sync with controlled value if provided
    React.useEffect(() => {
        if (value !== undefined) {
            setPreviousValue(currentValue)
            setCurrentValue(value)
        }
    }, [value])

    return (
        <TabsContext.Provider value={{ value: currentValue, previousValue }}>
            <TabsPrimitive.Root
                ref={ref}
                value={value}
                defaultValue={defaultValue}
                onValueChange={handleValueChange}
                {...props}
            />
        </TabsContext.Provider>
    )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className
        )}
        {...props}
    >
        {children}
    </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContents = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const { value } = React.useContext(TabsContext)

    return (
        <div className={cn("mt-2 overflow-hidden", className)} {...props}>
            <AnimatePresence mode="wait" initial={false}>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child) && (child.props as any).value === value) {
                        return (
                            <motion.div
                                key={(child.props as any).value}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                {child}
                            </motion.div>
                        )
                    }
                    return null
                })}
            </AnimatePresence>
        </div>
    )
}

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        forceMount
        className={cn(
            "ring-offset-background focus-visible:ring-2 focus:ring-ring focus:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent }
