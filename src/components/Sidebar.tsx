import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, ArrowRightLeft, Flame, Settings, ChevronLeft, ChevronRight, Users2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
}

const initialNavItems: NavItem[] = [
  { id: 'league', icon: Users2, label: 'League', path: '/league' },
  { id: 'lineup', icon: Users, label: 'Lineup Optimizer', path: '/lineup' },
  { id: 'trending', icon: Flame, label: 'Trending Up/Down', path: '/trending' },
  { id: 'trades', icon: ArrowRightLeft, label: 'Trade Analyzer', path: '/trades' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

interface SortableNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
}

const SortableNavItem = ({ item, isCollapsed }: SortableNavItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
  } : undefined;

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
            isActive
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`
        }
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </NavLink>
    </li>
  );
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [navItems, setNavItems] = useState(initialNavItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNavItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white h-[calc(100vh-4rem)] shadow-lg relative transition-all duration-300`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
      
      <nav className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={navItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {navItems.map((item) => (
                <SortableNavItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </nav>
    </div>
  );
}