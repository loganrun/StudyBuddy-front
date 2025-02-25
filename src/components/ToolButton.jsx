import React from 'react'
//import {LucideIcon} from 'lucide-react'
import {Button} from './Button'



const ToolButton = ({label, icon, onclick, isActive, isDisabled}) => {
  return (
    <Button
    disabled={isDisabled}
    isActive={isActive}
    onClick={onclick}
    variant= {isActive ? "boardActive" : 'board'}
    icon={icon}
    size={12}
    >

    </Button>
  )
}

export default ToolButton