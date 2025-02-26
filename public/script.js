document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');
	// You could initialize your WebRTC connection here if needed
});

const fns = {
	getPageHTML: () => {
		return { success: true, html: document.documentElement.outerHTML };
	},
	changeBackgroundColor: ({ color }) => {
		document.body.style.backgroundColor = color;
		return { success: true, color };
	},
	changeTextColor: ({ color }) => {
		document.body.style.color = color;
		return { success: true, color };
	},
	// New functions
	addText: ({ text, elementId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		const paragraph = document.createElement('p');
		paragraph.textContent = text;
		
		// Ensure the element has an ID
		const paragraphId = generateUniqueId('text');
		paragraph.id = paragraphId;
		
		targetElement.appendChild(paragraph);
		return { success: true, text, elementId, createdElementId: paragraphId };
	},
	addButton: ({ text, elementId, buttonId, className }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		const button = document.createElement('button');
		button.textContent = text;
		
		// Ensure the button has an ID
		const actualButtonId = buttonId || generateUniqueId('button');
		button.id = actualButtonId;
		
		if (className) button.className = className;
		targetElement.appendChild(button);
		return { success: true, buttonId: actualButtonId };
	},
	addInputField: ({ placeholder, type, elementId, inputId, className }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		const input = document.createElement('input');
		input.type = type || 'text';
		if (placeholder) input.placeholder = placeholder;
		
		// Ensure the input has an ID
		const actualInputId = inputId || generateUniqueId('input');
		input.id = actualInputId;
		
		if (className) input.className = className;
		targetElement.appendChild(input);
		return { success: true, inputId: actualInputId };
	},
	addDropdownMenu: ({ options, elementId, selectId, className }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		// Create a select element
		const select = document.createElement('select');
		
		// Ensure the select has an ID
		const actualSelectId = selectId || generateUniqueId('select');
		select.id = actualSelectId;
		
		if (className) select.className = className;
		
		// Add options to the select element
		options.forEach(option => {
			const optElement = document.createElement('option');
			optElement.value = option.value;
			optElement.textContent = option.text;
			select.appendChild(optElement);
		});
		
		// Append the select element to the target
		targetElement.appendChild(select);
		
		return { success: true, selectId: actualSelectId };
	},
	changeElementOrder: ({ elementIds }) => {
		const parent = document.querySelector('.content');
		if (!parent) {
			return { success: false, error: 'Content container not found' };
		}
		
		const elements = [];
		let missingElements = [];
		
		// Collect all elements and check if they exist
		elementIds.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				elements.push(element);
			} else {
				missingElements.push(id);
			}
		});
		
		if (missingElements.length > 0) {
			return { success: false, error: `Elements not found: ${missingElements.join(', ')}` };
		}
		
		// Remove elements from DOM temporarily
		elements.forEach(el => el.remove());
		
		// Add them back in the specified order
		elements.forEach(el => parent.appendChild(el));
		
		return { success: true, newOrder: elementIds };
	},
	changeTextStyle: ({ elementId, styles }) => {
		const element = elementId ? document.getElementById(elementId) : null;
		if (!element) {
			return { success: false, error: 'Element not found' };
		}
		
		// Apply the styles
		if (styles.fontSize) element.style.fontSize = styles.fontSize;
		if (styles.fontWeight) element.style.fontWeight = styles.fontWeight;
		if (styles.textAlign) element.style.textAlign = styles.textAlign;
		if (styles.fontFamily) element.style.fontFamily = styles.fontFamily;
		if (styles.fontStyle) element.style.fontStyle = styles.fontStyle;
		if (styles.textDecoration) element.style.textDecoration = styles.textDecoration;
		if (styles.lineHeight) element.style.lineHeight = styles.lineHeight;
		if (styles.letterSpacing) element.style.letterSpacing = styles.letterSpacing;
		
		return { success: true, elementId, appliedStyles: styles };
	},
	// Add new positioning functions
	insertElementBefore: ({ newElement, targetId }) => {
		const targetElement = document.getElementById(targetId);
		if (!targetElement) {
			return { success: false, error: `Target element with ID ${targetId} not found` };
		}
		
		let elementToInsert;
		
		// Create the element based on the type
		if (newElement.type === 'text') {
			elementToInsert = document.createElement('p');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'button') {
			elementToInsert = document.createElement('button');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'input') {
			elementToInsert = document.createElement('input');
			elementToInsert.type = newElement.inputType || 'text';
			elementToInsert.placeholder = newElement.placeholder || '';
		} else {
			return { success: false, error: 'Unsupported element type' };
		}
		
		// Ensure the element has an ID
		const elementId = newElement.id || generateUniqueId(newElement.type);
		elementToInsert.id = elementId;
		
		if (newElement.className) elementToInsert.className = newElement.className;
		
		// Insert before the target
		targetElement.parentNode.insertBefore(elementToInsert, targetElement);
		
		return { success: true, insertedElementId: elementId };
	},
	
	insertElementAfter: ({ newElement, targetId }) => {
		const targetElement = document.getElementById(targetId);
		if (!targetElement) {
			return { success: false, error: `Target element with ID ${targetId} not found` };
		}
		
		let elementToInsert;
		
		// Create the element based on the type
		if (newElement.type === 'text') {
			elementToInsert = document.createElement('p');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'button') {
			elementToInsert = document.createElement('button');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'input') {
			elementToInsert = document.createElement('input');
			elementToInsert.type = newElement.inputType || 'text';
			elementToInsert.placeholder = newElement.placeholder || '';
		} else {
			return { success: false, error: 'Unsupported element type' };
		}
		
		// Ensure the element has an ID
		const elementId = newElement.id || generateUniqueId(newElement.type);
		elementToInsert.id = elementId;
		
		if (newElement.className) elementToInsert.className = newElement.className;
		
		// Insert after the target
		targetElement.parentNode.insertBefore(elementToInsert, targetElement.nextSibling);
		
		return { success: true, insertedElementId: elementId };
	},
	
	moveElement: ({ elementId, targetId, position }) => {
		const element = document.getElementById(elementId);
		const targetElement = document.getElementById(targetId);
		
		if (!element) {
			return { success: false, error: `Element with ID ${elementId} not found` };
		}
		
		if (!targetElement) {
			return { success: false, error: `Target element with ID ${targetId} not found` };
		}
		
		// Remove the element from its current position
		element.remove();
		
		// Insert at the specified position relative to the target
		if (position === 'before') {
			targetElement.parentNode.insertBefore(element, targetElement);
		} else if (position === 'after') {
			targetElement.parentNode.insertBefore(element, targetElement.nextSibling);
		} else if (position === 'prepend') {
			// Insert as first child of target
			targetElement.prepend(element);
		} else if (position === 'append') {
			// Insert as last child of target
			targetElement.appendChild(element);
		} else {
			return { success: false, error: 'Invalid position. Use "before", "after", "prepend", or "append"' };
		}
		
		return { success: true, movedElementId: elementId, position };
	},
	
	deleteElement: ({ elementId }) => {
		const element = document.getElementById(elementId);
		if (!element) {
			return { success: false, error: `Element with ID ${elementId} not found` };
		}
		
		// Remove the element from the DOM
		element.remove();
		
		return { success: true, deletedElementId: elementId };
	},
	
	parseAndAddHTML: ({ html, elementId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		// Create a temporary container
		const tempContainer = document.createElement('div');
		tempContainer.innerHTML = html;
		
		// Move all child nodes from the temporary container to the target element
		while (tempContainer.firstChild) {
			targetElement.appendChild(tempContainer.firstChild);
		}
		
		return { success: true, elementId };
	},
	listPageElements: () => {
		// Get all elements with IDs
		const elementsWithIds = document.querySelectorAll('[id]');
		const elementsList = [];
		
		// Create a list of all elements with their IDs
		elementsWithIds.forEach(el => {
			elementsList.push({
				id: el.id,
				tagName: el.tagName.toLowerCase(),
				text: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : ''),
				visible: el.offsetParent !== null
			});
		});
		
		return { 
			success: true, 
			elements: elementsList,
			count: elementsList.length
		};
	},
	getElementInfo: ({ elementId }) => {
		const element = document.getElementById(elementId);
		
		if (!element) {
			// Try a case-insensitive search as a fallback
			const allElements = document.querySelectorAll('[id]');
			let foundElement = null;
			
			allElements.forEach(el => {
				if (el.id.toLowerCase() === elementId.toLowerCase()) {
					foundElement = el;
				}
			});
			
			if (foundElement) {
				return { 
					success: true, 
					found: true,
					exactMatch: false,
					element: {
						id: foundElement.id,
						tagName: foundElement.tagName.toLowerCase(),
						text: foundElement.textContent.substring(0, 50) + (foundElement.textContent.length > 50 ? '...' : '')
					}
				};
			}
			
			return { success: false, found: false, error: `Element with ID ${elementId} not found` };
		}
		
		return { 
			success: true, 
			found: true,
			exactMatch: true,
			element: {
				id: element.id,
				tagName: element.tagName.toLowerCase(),
				text: element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : '')
			}
		};
	}
};

// Create a WebRTC Agent
const peerConnection = new RTCPeerConnection();

// On inbound audio add to page
peerConnection.ontrack = (event) => {
	const el = document.createElement('audio');
	el.srcObject = event.streams[0];
	el.autoplay = el.controls = true;
	document.body.appendChild(el);
};

const dataChannel = peerConnection.createDataChannel('oai-events');

function configureData() {
	console.log('Configuring data channel');
	const event = {
		type: 'session.update',
		session: {
			modalities: ['text', 'audio'],
			// Provide the tools. Note they match the keys in the `fns` object above
			tools: [
				{
					type: 'function',
					name: 'changeBackgroundColor',
					description: 'Changes the background color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value of the color' },
						},
					},
				},
				{
					type: 'function',
					name: 'changeTextColor',
					description: 'Changes the text color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value of the color' },
						},
					},
				},
				{
					type: 'function',
					name: 'getPageHTML',
					description: 'Gets the HTML for the current page',
				},
				// New tool definitions
				{
					type: 'function',
					name: 'addText',
					description: 'Adds a new text paragraph to the page',
					parameters: {
						type: 'object',
						properties: {
							text: { type: 'string', description: 'The text content to add' },
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
						},
						required: ['text']
					},
				},
				{
					type: 'function',
					name: 'addButton',
					description: 'Adds a new button to the page',
					parameters: {
						type: 'object',
						properties: {
							text: { type: 'string', description: 'The button text' },
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
							buttonId: { type: 'string', description: 'Optional ID for the button' },
							className: { type: 'string', description: 'Optional CSS class for the button' },
						},
						required: ['text']
					},
				},
				{
					type: 'function',
					name: 'addInputField',
					description: 'Adds a new input field to the page',
					parameters: {
						type: 'object',
						properties: {
							placeholder: { type: 'string', description: 'Placeholder text for the input' },
							type: { type: 'string', description: 'Input type (text, number, email, etc.)' },
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
							inputId: { type: 'string', description: 'Optional ID for the input' },
							className: { type: 'string', description: 'Optional CSS class for the input' },
						}
					},
				},
				{
					type: 'function',
					name: 'addDropdownMenu',
					description: 'Adds a dropdown menu to the page',
					parameters: {
						type: 'object',
						properties: {
							options: { 
								type: 'array', 
								description: 'Array of options for the dropdown',
								items: {
									type: 'object',
									properties: {
										value: { type: 'string', description: 'Option value' },
										text: { type: 'string', description: 'Option display text' }
									}
								}
							},
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
							selectId: { type: 'string', description: 'Optional ID for the select element' },
							className: { type: 'string', description: 'Optional CSS class for the select element' },
						},
						required: ['options']
					},
				},
				{
					type: 'function',
					name: 'changeElementOrder',
					description: 'Changes the order of elements on the page',
					parameters: {
						type: 'object',
						properties: {
							elementIds: { 
								type: 'array', 
								description: 'Array of element IDs in the desired order',
								items: { type: 'string' }
							}
						},
						required: ['elementIds']
					},
				},
				{
					type: 'function',
					name: 'changeTextStyle',
					description: 'Changes the style of text in an element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { type: 'string', description: 'ID of the element to style' },
							styles: { 
								type: 'object',
								description: 'Style properties to apply',
								properties: {
									fontSize: { type: 'string', description: 'Font size (e.g., "16px", "1.2em")' },
									fontWeight: { type: 'string', description: 'Font weight (e.g., "bold", "400")' },
									textAlign: { type: 'string', description: 'Text alignment (e.g., "left", "center", "right")' },
									fontFamily: { type: 'string', description: 'Font family' },
									fontStyle: { type: 'string', description: 'Font style (e.g., "italic")' },
									textDecoration: { type: 'string', description: 'Text decoration (e.g., "underline")' },
									lineHeight: { type: 'string', description: 'Line height' },
									letterSpacing: { type: 'string', description: 'Letter spacing' }
								}
							}
						},
						required: ['elementId', 'styles']
					},
				},
				// New positioning tools
				{
					type: 'function',
					name: 'insertElementBefore',
					description: 'Inserts a new element before a target element',
					parameters: {
						type: 'object',
						properties: {
							newElement: {
								type: 'object',
								description: 'The element to insert',
								properties: {
									type: { 
										type: 'string', 
										description: 'Type of element to create (text, button, input)' 
									},
									content: { 
										type: 'string', 
										description: 'Text content for the element' 
									},
									id: { 
										type: 'string', 
										description: 'Optional ID for the new element' 
									},
									className: { 
										type: 'string', 
										description: 'Optional CSS class for the new element' 
									},
									inputType: { 
										type: 'string', 
										description: 'Type of input (for input elements only)' 
									},
									placeholder: { 
										type: 'string', 
										description: 'Placeholder text (for input elements only)' 
									}
								},
								required: ['type']
							},
							targetId: { 
								type: 'string', 
								description: 'ID of the element to insert before' 
							}
						},
						required: ['newElement', 'targetId']
					}
				},
				{
					type: 'function',
					name: 'insertElementAfter',
					description: 'Inserts a new element after a target element',
					parameters: {
						type: 'object',
						properties: {
							newElement: {
								type: 'object',
								description: 'The element to insert',
								properties: {
									type: { 
										type: 'string', 
										description: 'Type of element to create (text, button, input)' 
									},
									content: { 
										type: 'string', 
										description: 'Text content for the element' 
									},
									id: { 
										type: 'string', 
										description: 'Optional ID for the new element' 
									},
									className: { 
										type: 'string', 
										description: 'Optional CSS class for the new element' 
									},
									inputType: { 
										type: 'string', 
										description: 'Type of input (for input elements only)' 
									},
									placeholder: { 
										type: 'string', 
										description: 'Placeholder text (for input elements only)' 
									}
								},
								required: ['type']
							},
							targetId: { 
								type: 'string', 
								description: 'ID of the element to insert after' 
							}
						},
						required: ['newElement', 'targetId']
					}
				},
				{
					type: 'function',
					name: 'moveElement',
					description: 'Moves an existing element to a new position relative to another element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to move' 
							},
							targetId: { 
								type: 'string', 
								description: 'ID of the target element' 
							},
							position: { 
								type: 'string', 
								description: 'Position relative to target: "before", "after", "prepend" (as first child), or "append" (as last child)' 
							}
						},
						required: ['elementId', 'targetId', 'position']
					}
				},
				{
					type: 'function',
					name: 'deleteElement',
					description: 'Deletes an element from the page',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to delete' 
							}
						},
						required: ['elementId']
					}
				},
				{
					type: 'function',
					name: 'parseAndAddHTML',
					description: 'Parses and adds HTML content to the page',
					parameters: {
						type: 'object',
						properties: {
							html: { 
								type: 'string', 
								description: 'HTML content to add to the page' 
							},
							elementId: { 
								type: 'string', 
								description: 'Optional ID of the element to append to (defaults to .content)' 
							}
						},
						required: ['html']
					}
				},
				{
					type: 'function',
					name: 'listPageElements',
					description: 'Lists all elements with IDs on the page',
				},
				{
					type: 'function',
					name: 'getElementInfo',
					description: 'Gets information about a specific element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to get information about' 
							}
						},
						required: ['elementId']
					}
				}
			],
		},
	};
	dataChannel.send(JSON.stringify(event));
}

dataChannel.addEventListener('open', (ev) => {
	console.log('Opening data channel', ev);
	configureData();
});

// {
//     "type": "response.function_call_arguments.done",
//     "event_id": "event_Ad2gt864G595umbCs2aF9",
//     "response_id": "resp_Ad2griUWUjsyeLyAVtTtt",
//     "item_id": "item_Ad2gsxA84w9GgEvFwW1Ex",
//     "output_index": 1,
//     "call_id": "call_PG12S5ER7l7HrvZz",
//     "name": "get_weather",
//     "arguments": "{\"location\":\"Portland, Oregon\"}"
// }

dataChannel.addEventListener('message', async (ev) => {
	const msg = JSON.parse(ev.data);
	// Handle function calls
	if (msg.type === 'response.function_call_arguments.done') {
		const fn = fns[msg.name];
		if (fn !== undefined) {
			console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
			const args = JSON.parse(msg.arguments);
			const result = await fn(args);
			console.log('result', result);
			// Let OpenAI know that the function has been called and share it's output
			const event = {
				type: 'conversation.item.create',
				item: {
					type: 'function_call_output',
					call_id: msg.call_id, // call_id from the function_call message
					output: JSON.stringify(result), // result of the function
				},
			};
			dataChannel.send(JSON.stringify(event));
			// Have assistant respond after getting the results
			dataChannel.send(JSON.stringify({type:"response.create"}));
		}
	}
});

// Capture microphone
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
	// Add microphone to PeerConnection
	stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: 'sendrecv' }));

	peerConnection.createOffer().then((offer) => {
		peerConnection.setLocalDescription(offer);
		fetch('/session')
			.then((tokenResponse) => tokenResponse.json())
			.then((data) => {
				const EPHEMERAL_KEY = data.result.client_secret.value;
				const baseUrl = 'https://api.openai.com/v1/realtime';
				const model = 'gpt-4o-realtime-preview-2024-12-17';
				fetch(`${baseUrl}?model=${model}`, {
					method: 'POST',
					body: offer.sdp,
					headers: {
						Authorization: `Bearer ${EPHEMERAL_KEY}`,
						'Content-Type': 'application/sdp',
					},
				})
					.then((r) => r.text())
					.then((answer) => {
						// Accept answer from Realtime WebRTC API
						peerConnection.setRemoteDescription({
							sdp: answer,
							type: 'answer',
						});
					});
			});

		// Send WebRTC Offer to Workers Realtime WebRTC API Relay
	});
});

// Add this helper function at the beginning of the script
function generateUniqueId(prefix = 'element') {
	const timestamp = new Date().getTime();
	const random = Math.floor(Math.random() * 10000);
	return `${prefix}-${timestamp}-${random}`;
}

// Then modify the relevant functions to use this helper
