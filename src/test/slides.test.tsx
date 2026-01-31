import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlideThumb } from '../components/slides/SlideThumb'
import { SlideList } from '../components/slides/SlideList'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'
import { act } from '@testing-library/react'

describe('SlideThumb', () => {
  const mockOnSelect = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
    mockOnDelete.mockClear()
  })

  describe('rendering', () => {
    it('should render slide number correctly', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render placeholder when no thumbnail provided', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should render thumbnail image when provided', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          thumbnail="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', expect.stringContaining('data:image/png'))
    })

    it('should apply ring class when active', () => {
      const { container } = render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={true}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('ring-2')
      expect(wrapper.className).toContain('ring-blue-500')
    })

    it('should not apply ring class when not active', () => {
      const { container } = render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('ring-2')
    })
  })

  describe('interactions', () => {
    it('should call onSelect when clicked', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      fireEvent.click(screen.getByText('1').closest('div')?.parentElement as HTMLElement)
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('should call onDelete when delete button is clicked', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: 'スライドを削除' })
      fireEvent.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('should stop propagation when delete button is clicked', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      const deleteButton = screen.getByRole('button', { name: 'スライドを削除' })
      fireEvent.click(deleteButton)

      expect(mockOnSelect).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have accessible delete button label', () => {
      render(
        <SlideThumb
          slideId="slide-1"
          index={0}
          isActive={false}
          onSelect={mockOnSelect}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByRole('button', { name: 'スライドを削除' })).toBeInTheDocument()
    })
  })
})

describe('SlideList', () => {
  beforeEach(() => {
    // Reset stores before each test
    useSlideStore.setState({
      project: null,
      slides: [
        {
          id: 'slide-1',
          canvasJson: '{}',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'slide-2',
          canvasJson: '{}',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    })
    useEditorStore.setState({
      currentSlideId: 'slide-1',
      selectedObjectIds: [],
      activeTool: 'select',
      zoom: 1,
    })
  })

  describe('layout and sizing', () => {
    it('should have minimum width to prevent panel from being too narrow', () => {
      const { container } = render(<SlideList />)

      const slideList = container.firstChild as HTMLElement
      const computedStyle = window.getComputedStyle(slideList)

      // w-52 = 13rem = 208px, min-w-52 should enforce minimum width
      // Check that the element has min-width class or style
      expect(slideList.className).toContain('min-w-')
    })

    it('should have flex-shrink-0 to prevent being compressed in flex container', () => {
      const { container } = render(<SlideList />)

      const slideList = container.firstChild as HTMLElement

      // flex-shrink-0 should be set to prevent compression
      expect(slideList.className).toContain('shrink-0')
    })
  })

  describe('rendering', () => {
    it('should render all slides', () => {
      render(<SlideList />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should highlight active slide', () => {
      render(<SlideList />)

      const firstSlideThumb = screen.getByText('1').closest('.ring-2')
      expect(firstSlideThumb).toBeInTheDocument()
    })

    it('should render add slide button', () => {
      render(<SlideList />)

      expect(screen.getByText('+ スライド追加')).toBeInTheDocument()
    })
  })

  describe('add slide', () => {
    it('should add a new slide when button is clicked', () => {
      render(<SlideList />)

      const initialSlideCount = useSlideStore.getState().slides.length

      const addButton = screen.getByText('+ スライド追加')
      fireEvent.click(addButton)

      const newSlideCount = useSlideStore.getState().slides.length
      expect(newSlideCount).toBe(initialSlideCount + 1)
    })
  })

  describe('delete slide', () => {
    it('should delete a slide when delete button is clicked', () => {
      render(<SlideList />)

      const { slides } = useSlideStore.getState()
      const initialSlideCount = slides.length

      // Find and click delete button for second slide
      const deleteButtons = screen.getAllByRole('button', { name: 'スライドを削除' })
      fireEvent.click(deleteButtons[1])

      const newSlideCount = useSlideStore.getState().slides.length
      expect(newSlideCount).toBe(initialSlideCount - 1)
    })

    it('should not delete the last slide', () => {
      // Set up with only one slide
      act(() => {
        useSlideStore.setState({
          project: null,
          slides: [
            {
              id: 'slide-1',
              canvasJson: '{}',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })
      })

      render(<SlideList />)

      const initialSlideCount = useSlideStore.getState().slides.length

      const deleteButton = screen.getByRole('button', { name: 'スライドを削除' })
      fireEvent.click(deleteButton)

      const newSlideCount = useSlideStore.getState().slides.length
      expect(newSlideCount).toBe(initialSlideCount)
    })

    it('should select another slide when deleting current slide', () => {
      render(<SlideList />)

      const initialCurrentSlideId = useEditorStore.getState().currentSlideId

      // Delete the current slide (first slide)
      const deleteButtons = screen.getAllByRole('button', { name: 'スライドを削除' })
      fireEvent.click(deleteButtons[0])

      const newCurrentSlideId = useEditorStore.getState().currentSlideId
      expect(newCurrentSlideId).not.toBe(initialCurrentSlideId)
      expect(newCurrentSlideId).toBe('slide-2')
    })
  })

  describe('select slide', () => {
    it('should change current slide when slide thumbnail is clicked', () => {
      render(<SlideList />)

      // Click on second slide
      const secondSlideNumber = screen.getAllByText('2')[0]
      fireEvent.click(secondSlideNumber.closest('div.relative') as HTMLElement)

      expect(useEditorStore.getState().currentSlideId).toBe('slide-2')
    })
  })

  describe('reorder slides', () => {
    it('should reorder slides when drag and drop', () => {
      render(<SlideList />)

      const { slides: initialSlides } = useSlideStore.getState()
      const firstSlideId = initialSlides[0].id
      const secondSlideId = initialSlides[1].id

      // Simulate drag start
      const slideElements = screen.getAllByText(/Slide \d+/)
      const firstSlideElement = slideElements[0].closest('div[draggable]') as HTMLElement

      fireEvent.dragStart(firstSlideElement, {
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn(() => '0'),
        },
      })

      // Simulate drop on second position
      const secondSlideElement = slideElements[1].closest('div[draggable]') as HTMLElement
      fireEvent.drop(secondSlideElement, {
        dataTransfer: {
          getData: vi.fn(() => '0'),
        },
      })

      const { slides: newSlides } = useSlideStore.getState()
      expect(newSlides[0].id).toBe(secondSlideId)
      expect(newSlides[1].id).toBe(firstSlideId)
    })

    it('should not reorder when dropping on same position', () => {
      render(<SlideList />)

      const { slides: initialSlides } = useSlideStore.getState()

      // Simulate drag start
      const slideElements = screen.getAllByText(/Slide \d+/)
      const firstSlideElement = slideElements[0].closest('div[draggable]') as HTMLElement

      fireEvent.dragStart(firstSlideElement, {
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn(() => '0'),
        },
      })

      // Simulate drop on same position
      fireEvent.drop(firstSlideElement, {
        dataTransfer: {
          getData: vi.fn(() => '0'),
        },
      })

      const { slides: newSlides } = useSlideStore.getState()
      expect(newSlides).toEqual(initialSlides)
    })
  })
})
