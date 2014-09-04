#include <pebble.h>
#include <string.h>
		
Window* window;
TextLayer *text_layer;

char g_state[32];

//Appmessage stuff
enum {
	KEY_PIN = 0,
	KEY_STATE = 1,
	KEY_ISGET = 2,
	KEY_SETSTATE = 3,
	KEY_IP = 4,
};

//For sending appmessages
void send_int(uint8_t key, uint8_t cmd)
{
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
 
    Tuplet value = TupletInteger(key, cmd);
    dict_write_tuplet(iter, &value);
 
    app_message_outbox_send();
}

void process_tuple(Tuple *t)
{
  //Get key
  int key = t->key;
  
  char string_value[32];
  strcpy(string_value, t->value->cstring);
	
  //Decide what to do
  switch(key) {
    case KEY_PIN:
      
      break;
    case KEY_STATE:
     if(strcmp(string_value,"true") == 0)
			{
		 	text_layer_set_text(text_layer, "ON");
		    }
	  else
		  	text_layer_set_text(text_layer, "OFF");
	  //copy the state of the pin to state
	  strcpy(g_state,string_value);
      break;
	 case KEY_IP:
	  persist_write_string(KEY_IP, string_value);
	  break;
  }
}

static void in_received_handler(DictionaryIterator *iter, void *context)
{
	(void) context;
     
    //Get data
    Tuple *t = dict_read_first(iter);
    while(t != NULL)
    {
        process_tuple(t);
         
        //Get next
        t = dict_read_next(iter);
    }
}
	
void up_click_handler(ClickRecognizerRef recognizer, void *context) 
{
	//text_layer_set_text(text_layer, "You pressed UP!");
}

void down_click_handler(ClickRecognizerRef recognizer, void *context) 
{
	//text_layer_set_text(text_layer, "You pressed DOWN!");
}

void select_click_handler(ClickRecognizerRef recognizer, void *context)
{
	send_int(2,0);
		
	//Create an array of ON-OFF-ON etc durations in milliseconds
	uint32_t segments[] = {100};
	
	//Create a VibePattern structure with the segments and length of the pattern as fields
	VibePattern pattern = {
		.durations = segments,
		.num_segments = ARRAY_LENGTH(segments),
	};

	//Trigger the custom pattern to be executed
	vibes_enqueue_custom_pattern(pattern);
}

void click_config_provider(void *context) 
{
	window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
	window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
	window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

/* Load all Window sub-elements */
void window_load(Window *window)
{
	text_layer = text_layer_create(GRect(0, 0, 144, 168));
	text_layer_set_background_color(text_layer, GColorClear);
	text_layer_set_text_color(text_layer, GColorBlack);
	
	layer_add_child(window_get_root_layer(window), (Layer*) text_layer);
	//text_layer_set_text(text_layer, "Press a button!");
}

/* Un-load all Window sub-elements */
void window_unload(Window *window)
{
	text_layer_destroy(text_layer);
}

/* Initialize the main app elements */
void init()
{
	window = window_create();
	WindowHandlers handlers = {
		.load = window_load,
		.unload = window_unload
	};
	window_set_window_handlers(window, (WindowHandlers) handlers);
	window_set_click_config_provider(window, click_config_provider);
	//Register AppMessage events
	app_message_register_inbox_received(in_received_handler);
	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());    //Largest possible input and output buffer sizes
	
	window_stack_push(window, true);
}

/* De-initialize the main app elements */
void deinit()
{
	window_destroy(window);
}

/* Main app lifecycle */
int main(void)
{
	init();
	app_event_loop();
	deinit();
}