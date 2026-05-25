/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

// Jest JSDOM doesn't support TextEncoder by default in older versions but we can just use Jest's JSDOM environment features
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('navigateToSection', () => {
    let originalScrollTo;

    beforeAll(() => {
        // Load the HTML
        document.documentElement.innerHTML = html.toString();

        // Use regex to extract the actual function from the script tag
        // Since we are running in jest-environment-jsdom, we can evaluate it directly in the node context
        // and it will attach to the global window object.
        const scriptTags = document.querySelectorAll('script');
        let functionSource = '';
        for (const script of scriptTags) {
            if (script.textContent.includes('function navigateToSection')) {
                // Find just the function definition using regex, to avoid eval'ing the entire script
                // which might have other side effects we don't want right now
                const match = script.textContent.match(/function navigateToSection\(sectionId\)\s*{[\s\S]*?}\s*function/);
                if (match) {
                    // Remove the trailing 'function' we used to bound the match
                    functionSource = match[0].replace(/\s*function$/, '');
                } else {
                    // Fallback simpler match if it's the last function
                    const match2 = script.textContent.match(/function navigateToSection\(sectionId\)\s*{[\s\S]*?}$/);
                    if (match2) {
                        functionSource = match2[0];
                    }
                }
            }
        }

        if (functionSource) {
            // Eval the actual source code into the global scope
            // We use global.eval to ensure it hits the global context
            global.eval(functionSource);
        } else {
            throw new Error('Could not find navigateToSection source code');
        }
    });

    beforeEach(() => {
        // Mock navigate that is called inside navigateToSection
        window.navigate = jest.fn();

        originalScrollTo = window.scrollTo;
        window.scrollTo = jest.fn();

        // Mock getBoundingClientRect for elements
        Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {
                width: 100,
                height: 100,
                top: 500,
                left: 0,
                bottom: 0,
                right: 0,
            }
        });

        // Mock window.pageYOffset
        Object.defineProperty(window, 'pageYOffset', {
            value: 200,
            writable: true,
            configurable: true
        });

        jest.useFakeTimers();
    });

    afterEach(() => {
        window.scrollTo = originalScrollTo;
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should call navigate to home', () => {
        // Now navigateToSection should exist on window
        window.navigateToSection('soluciones-grid');
        expect(window.navigate).toHaveBeenCalledWith('home');
    });

    it('should scroll to the element position with offset after 50ms', () => {
        // Create a dummy element that the function can find
        const dummyElement = document.createElement('div');
        dummyElement.id = 'test-section';
        document.body.appendChild(dummyElement);

        window.navigateToSection('test-section');

        // Before timeout, scrollTo shouldn't be called
        expect(window.scrollTo).not.toHaveBeenCalled();

        // Fast-forward time
        jest.advanceTimersByTime(50);

        // Expected Y position:
        // top (500) + pageYOffset (200) - 100 = 600
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 600,
            behavior: 'smooth'
        });

        // Cleanup
        document.body.removeChild(dummyElement);
    });

    it('should handle elements that do not exist gracefully', () => {
        window.navigateToSection('non-existent-section');

        jest.advanceTimersByTime(50);

        // Should not call scrollTo if element doesn't exist
        expect(window.scrollTo).not.toHaveBeenCalled();
    });
});
