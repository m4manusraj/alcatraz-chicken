'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-1 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                view === 'grid' 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onViewChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid view</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                view === 'list' 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onViewChange('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>List view</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
